import cors from "cors";
import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const port = Number(process.env.PORT ?? 4242);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const taxAmount = Number(process.env.CHECKOUT_TAX_AMOUNT ?? 15);
const shippingFee = Number(process.env.CHECKOUT_SHIPPING_FEE ?? 10);
const SUPPORTED_CURRENCIES = new Set(["TRY", "EUR", "USD", "RUB", "JPY"]);
const ZERO_DECIMAL_CURRENCIES = new Set(["JPY"]);

const parseServiceAccount = () => {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) {
    return null;
  }

  const jsonText = serviceAccount.trim().startsWith("{")
    ? serviceAccount
    : Buffer.from(serviceAccount, "base64").toString("utf8");

  return JSON.parse(jsonText);
};

const initializeFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccount = parseServiceAccount();
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  });
};

initializeFirebaseAdmin();

const auth = getAuth();
const db = getFirestore();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const normalizeCurrency = (currency) => {
  const upperCurrency = String(currency ?? "TRY").toUpperCase();
  return SUPPORTED_CURRENCIES.has(upperCurrency) ? upperCurrency : "TRY";
};

const formatToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const authenticateUser = async (request) => {
  const authorization = request.header("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing Firebase ID token");
  }

  const decodedToken = await auth.verifyIdToken(token);
  if (!decodedToken.email_verified) {
    throw new HttpError(403, "Email must be verified before checkout");
  }

  return decodedToken;
};

const getProductCurrency = (productData) =>
  normalizeCurrency(productData.productCurrency ?? productData.currency);

const getProductTitle = (productData) => productData.productName ?? "";

const getProductImage = (productData) => productData.productImage ?? "";

const toStripeAmount = (amount, currency) =>
  ZERO_DECIMAL_CURRENCIES.has(normalizeCurrency(currency))
    ? Math.round(amount)
    : Math.round(amount * 100);

const fromStripeAmount = (amount, currency) =>
  ZERO_DECIMAL_CURRENCIES.has(normalizeCurrency(currency))
    ? Number(amount ?? 0)
    : Number(amount ?? 0) / 100;

const buildCheckout = async ({ userId, itemIds, customer }) => {
  if (!Array.isArray(itemIds) || itemIds.length < 1) {
    throw new HttpError(400, "Missing checkout items");
  }

  const uniqueItemIds = itemIds.map(String);
  if (new Set(uniqueItemIds).size !== uniqueItemIds.length) {
    throw new HttpError(400, "Duplicate checkout items are not supported");
  }

  const fullName = String(customer?.name ?? "").trim();
  const emailAddress = String(customer?.email ?? "").trim();
  const detailedAddress = String(customer?.detailedAddress ?? "").trim();

  if (!fullName || !emailAddress || detailedAddress.length < 15) {
    throw new HttpError(400, "Missing customer details");
  }

  const checkoutRef = db.collection("checkout_sessions").doc();
  const productRefs = uniqueItemIds.map((itemId) =>
    db.collection("products_onsale").doc(itemId),
  );

  const checkout = await db.runTransaction(async (transaction) => {
    const productSnapshots = await Promise.all(
      productRefs.map((productRef) => transaction.get(productRef)),
    );

    const products = productSnapshots.map((productSnapshot, index) => {
      if (!productSnapshot.exists) {
        throw new HttpError(404, "Product not found");
      }

      const productData = productSnapshot.data() ?? {};
      const currentStock = productData.stockQuantity;
      const productPrice = Number(productData.productPrice ?? 0);
      const sellerId = String(productData.sellerId ?? "");

      if (typeof currentStock !== "number" || currentStock < 1) {
        throw new HttpError(409, "Product is out of stock");
      }

      if (sellerId === userId) {
        throw new HttpError(400, "You cannot buy your own item");
      }

      if (!Number.isFinite(productPrice) || productPrice <= 0) {
        throw new HttpError(400, "Invalid product price");
      }

      return {
        id: uniqueItemIds[index],
        title: getProductTitle(productData),
        price: productPrice,
        currency: getProductCurrency(productData),
        imageURL: getProductImage(productData),
        sellerId,
        status: "ordered",
      };
    });

    const currency = products[0]?.currency ?? "TRY";
    if (products.some((product) => product.currency !== currency)) {
      throw new HttpError(400, "Cart contains multiple currencies");
    }

    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const amount = subtotal + taxAmount + shippingFee;
    const now = new Date();

    const checkoutBody = {
      userId,
      fullName,
      emailAddress,
      detailedAddress,
      itemIds: uniqueItemIds,
      items: products,
      subtotal,
      tax: taxAmount,
      shippingFee,
      amount,
      currency,
      status: "pending_payment",
      createDate: formatToDDMMYYYY(now),
      createdAt: FieldValue.serverTimestamp(),
    };

    transaction.set(checkoutRef, checkoutBody);
    return { id: checkoutRef.id, ...checkoutBody };
  });

  return checkout;
};

const createPaymentIntent = async (checkout) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(checkout.amount, checkout.currency),
    currency: checkout.currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      checkoutId: checkout.id,
      userId: checkout.userId,
      itemIds: checkout.itemIds.join(","),
    },
  });

  await db.collection("checkout_sessions").doc(checkout.id).update({
    paymentIntentId: paymentIntent.id,
    paymentIntentStatus: paymentIntent.status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return paymentIntent;
};

const getPaymentRecord = (paymentIntent) => ({
  id: paymentIntent.id,
  amount: fromStripeAmount(paymentIntent.amount, paymentIntent.currency),
  currency: normalizeCurrency(paymentIntent.currency),
  paidAt: new Date().toISOString(),
  provider: "stripe",
  status: "succeeded",
});

const markCheckoutPaymentStatus = async (paymentIntent, status) => {
  const checkoutId = paymentIntent.metadata?.checkoutId;
  if (!checkoutId) {
    return;
  }

  await db.collection("checkout_sessions").doc(checkoutId).set(
    {
      status,
      paymentIntentId: paymentIntent.id,
      paymentIntentStatus: paymentIntent.status,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
};

const fulfillCheckout = async (paymentIntent) => {
  const checkoutId = paymentIntent.metadata?.checkoutId;
  if (!checkoutId) {
    throw new Error("PaymentIntent is missing checkoutId metadata");
  }

  const checkoutRef = db.collection("checkout_sessions").doc(checkoutId);

  await db.runTransaction(async (transaction) => {
    const checkoutSnapshot = await transaction.get(checkoutRef);
    if (!checkoutSnapshot.exists) {
      throw new Error(`Checkout ${checkoutId} not found`);
    }

    const checkout = checkoutSnapshot.data() ?? {};
    if (checkout.status === "fulfilled") {
      return;
    }

    if (
      checkout.paymentIntentId &&
      checkout.paymentIntentId !== paymentIntent.id
    ) {
      throw new Error("PaymentIntent does not match checkout");
    }

    const items = Array.isArray(checkout.items) ? checkout.items : [];
    const productRefs = items.map((item) =>
      db.collection("products_onsale").doc(String(item.id)),
    );
    const productSnapshots = await Promise.all(
      productRefs.map((productRef) => transaction.get(productRef)),
    );

    const unavailableItem = productSnapshots.find((productSnapshot) => {
      const stockQuantity = productSnapshot.data()?.stockQuantity;
      return typeof stockQuantity !== "number" || stockQuantity < 1;
    });

    if (unavailableItem) {
      transaction.update(checkoutRef, {
        status: "fulfillment_failed",
        failureReason: "Product is out of stock after payment",
        payment: getPaymentRecord(paymentIntent),
        paymentStatus: "paid",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    productSnapshots.forEach((productSnapshot, index) => {
      const currentStock = productSnapshot.data()?.stockQuantity;
      transaction.update(productRefs[index], {
        stockQuantity: currentStock - 1,
      });
    });

    const userOrderRef = db
      .collection("users")
      .doc(String(checkout.userId))
      .collection("orders")
      .doc();
    const orderRef = db.collection("orders").doc();
    const payment = getPaymentRecord(paymentIntent);
    const now = new Date();
    const orderBody = {
      fullName: checkout.fullName,
      emailAddress: checkout.emailAddress,
      detailedAddress: checkout.detailedAddress,
      items,
      priceSum: checkout.amount,
      currency: checkout.currency,
      payment,
      paymentStatus: "paid",
      status: "ordered",
      createDate: formatToDDMMYYYY(now),
      createdAt: FieldValue.serverTimestamp(),
    };

    items.forEach((item) => {
      if (!item.sellerId) {
        return;
      }

      const saleNotificationRef = db
        .collection("users")
        .doc(String(item.sellerId))
        .collection("saleNotifications")
        .doc();

      transaction.set(saleNotificationRef, {
        sellerId: item.sellerId,
        buyerId: checkout.userId,
        buyerName: checkout.fullName,
        buyerEmail: checkout.emailAddress,
        productId: String(item.id),
        productName: item.title ?? "",
        productPrice: item.price ?? 0,
        productCurrency: item.currency ?? checkout.currency,
        orderId: orderRef.id,
        userOrderId: userOrderRef.id,
        status: "unread",
        createdAt: FieldValue.serverTimestamp(),
        createDate: formatToDDMMYYYY(now),
      });
    });

    transaction.set(userOrderRef, orderBody);
    transaction.set(orderRef, orderBody);
    transaction.update(checkoutRef, {
      status: "fulfilled",
      payment,
      paymentStatus: "paid",
      orderId: orderRef.id,
      userOrderId: userOrderRef.id,
      fulfilledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
};

app.use(cors());

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event;

    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(
            request.body,
            request.header("stripe-signature"),
            webhookSecret,
          )
        : JSON.parse(request.body.toString("utf8"));
    } catch (error) {
      console.error("Stripe webhook verification failed:", error);
      response.sendStatus(400);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await fulfillCheckout(event.data.object);
          break;
        case "payment_intent.canceled":
          await markCheckoutPaymentStatus(event.data.object, "canceled");
          break;
        case "payment_intent.payment_failed":
          await markCheckoutPaymentStatus(event.data.object, "payment_failed");
          break;
        default:
          break;
      }

      response.sendStatus(200);
    } catch (error) {
      console.error("Stripe webhook handling failed:", error);
      response.sendStatus(500);
    }
  },
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/payment-sheet", async (request, response) => {
  try {
    const decodedToken = await authenticateUser(request);
    const checkout = await buildCheckout({
      userId: decodedToken.uid,
      itemIds: request.body.itemIds,
      customer: request.body.customer,
    });
    const paymentIntent = await createPaymentIntent(checkout);

    response.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: checkout.amount,
      currency: checkout.currency,
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error("Stripe payment-sheet error:", error);
    response.status(status).json({
      error: error instanceof Error ? error.message : "Unable to create payment intent",
    });
  }
});

app.listen(port, () => {
  console.log(`Stripe payment server running on http://localhost:${port}`);
});
