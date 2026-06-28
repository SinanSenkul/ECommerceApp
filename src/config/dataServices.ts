import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { normalizeCurrency, SupportedCurrency } from "../helpers/currency";

const getProductsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products_onsale"));
    const list: any[] = [];
    const sellerIds = new Set<string>();

    querySnapshot.forEach((document) => {
      const productData = document.data();
      if (
        typeof productData.stockQuantity === "number" &&
        productData.stockQuantity <= 0
      ) {
        return;
      }

      const { createdAt, ...serializableProductData } = productData;
      const product: any = {
        id: document.id,
        title: productData.productName,
        price: productData.productPrice,
        imageURL: productData.productImage,
        ...serializableProductData,
        currency: normalizeCurrency(
          productData.productCurrency ?? productData.currency,
        ),
      };

      if (typeof product.sellerId === "string" && product.sellerId.length > 0) {
        sellerIds.add(product.sellerId);
      }

      list.push(product);
    });

    const activeSellerIds = new Set(
      (
        await Promise.all(
          Array.from(sellerIds).map(async (sellerId) => {
            const sellerDoc = await getDoc(doc(db, "users", sellerId));
            return sellerDoc.exists() ? sellerId : null;
          }),
        )
      ).filter((sellerId): sellerId is string => Boolean(sellerId)),
    );

    return list.filter(
      (product) =>
        typeof product.sellerId !== "string" ||
        product.sellerId.length === 0 ||
        activeSellerIds.has(product.sellerId),
    );
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};

export { getProductsData };

export const getUserOrders = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return [];
    }

    const userOrdersRef = collection(doc(db, "users", userId), "orders");
    const docSnap = await getDocs(userOrdersRef);
    const orderList = docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orderList;
  } catch (error) {
    console.error("error fetching orders: ", error);
    return [];
  }
};

interface ProductOnSalePayload {
  productName: string;
  productPrice: number;
  productCurrency: SupportedCurrency;
  stockQuantity: number;
  productImages: string[];
  sellerId?: string;
}

export const addProductOnSale = async ({
  productName,
  productPrice,
  productCurrency,
  stockQuantity,
  productImages,
  sellerId,
}: ProductOnSalePayload) => {
  const productOnSaleBody = {
    productName,
    productPrice,
    productCurrency,
    stockQuantity,
    productImage: productImages[0] ?? "",
    productImages,
    sellerId: sellerId ?? auth.currentUser?.uid ?? "",
    createdAt: serverTimestamp(),
  };

  const productOnSaleRef = collection(db, "products_onsale");
  return addDoc(productOnSaleRef, productOnSaleBody);
};

export const getSellerProductsOnSale = async () => {
  try {
    const sellerId = auth.currentUser?.uid;
    if (!sellerId) {
      return [];
    }

    const productsOnSaleRef = collection(db, "products_onsale");
    const sellerProductsQuery = query(
      productsOnSaleRef,
      where("sellerId", "==", sellerId),
    );
    const querySnapshot = await getDocs(sellerProductsQuery);

    return querySnapshot.docs.flatMap((doc) => {
      const productData = doc.data();
      if (
        typeof productData.stockQuantity === "number" &&
        productData.stockQuantity <= 0
      ) {
        return [];
      }

      return [
        {
          id: doc.id,
          title: productData.productName,
          price: productData.productPrice,
          imageURL: productData.productImage,
          ...productData,
          currency: normalizeCurrency(
            productData.productCurrency ?? productData.currency,
          ),
        },
      ];
    });
  } catch (error) {
    console.error("error fetching seller products: ", error);
    return [];
  }
};

export const updateProductOnSalePrice = async (
  productId: string,
  productPrice: number,
) => {
  const productRef = doc(db, "products_onsale", productId);
  return updateDoc(productRef, { productPrice });
};

export const deleteProductOnSale = async (productId: string) => {
  const productRef = doc(db, "products_onsale", productId);
  return deleteDoc(productRef);
};

export const deleteUserPublicData = async (userId: string) => {
  const productsOnSaleRef = collection(db, "products_onsale");
  const userProductsQuery = query(
    productsOnSaleRef,
    where("sellerId", "==", userId),
  );
  const querySnapshot = await getDocs(userProductsQuery);
  const batch = writeBatch(db);

  querySnapshot.docs.forEach((productDoc) => {
    batch.delete(productDoc.ref);
  });

  batch.delete(doc(db, "users", userId));

  return batch.commit();
};

export const getSellerSaleNotifications = async () => {
  try {
    const sellerId = auth.currentUser?.uid;
    if (!sellerId) {
      return [];
    }

    const saleNotificationsRef = collection(
      doc(db, "users", sellerId),
      "saleNotifications",
    );
    const querySnapshot = await getDocs(saleNotificationsRef);

    return querySnapshot.docs.flatMap((doc) => {
      const notificationData = doc.data();
      if (notificationData.status === "shipped") {
        return [];
      }

      return [
        {
          id: doc.id,
          ...notificationData,
        },
      ];
    });
  } catch (error) {
    console.error("error fetching sale notifications: ", error);
    return [];
  }
};

export const markSaleNotificationOrderAsShipped = async ({
  notificationId,
  buyerId,
  userOrderId,
  orderId,
  productId,
}: {
  notificationId: string;
  buyerId: string;
  userOrderId: string;
  orderId: string;
  productId: string;
}) => {
  const sellerId = auth.currentUser?.uid;
  if (!sellerId) {
    throw new Error("Seller not found");
  }

  const userOrderRef = doc(db, "users", buyerId, "orders", userOrderId);
  const orderRef = doc(db, "orders", orderId);
  const saleNotificationRef = doc(
    db,
    "users",
    sellerId,
    "saleNotifications",
    notificationId,
  );

  return runTransaction(db, async (transaction) => {
    const [userOrderSnapshot, orderSnapshot] = await Promise.all([
      transaction.get(userOrderRef),
      transaction.get(orderRef),
    ]);

    const updateOrderItems = (orderData: Record<string, unknown>) => {
      const items = Array.isArray(orderData.items) ? orderData.items : [];
      const updatedItems = items.map((item) => {
        if (
          item &&
          typeof item === "object" &&
          String((item as { id?: string | number }).id) === productId
        ) {
          return { ...item, status: "shipped" };
        }

        return item;
      });
      const allItemsShipped =
        updatedItems.length > 0 &&
        updatedItems.every(
          (item) =>
            item &&
            typeof item === "object" &&
            (item as { status?: string }).status === "shipped",
        );

      return {
        items: updatedItems,
        status: allItemsShipped ? "shipped" : "ordered",
      };
    };

    if (userOrderSnapshot.exists()) {
      transaction.update(userOrderRef, updateOrderItems(userOrderSnapshot.data()));
    }
    if (orderSnapshot.exists()) {
      transaction.update(orderRef, updateOrderItems(orderSnapshot.data()));
    }
    transaction.delete(saleNotificationRef);
  });
};
