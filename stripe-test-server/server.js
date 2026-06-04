import cors from "cors";
import "dotenv/config";
import express from "express";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const port = Number(process.env.PORT ?? 4242);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/payment-sheet", async (request, response) => {
  try {
    const { amount, currency, userId, itemIds, customer } = request.body;

    if (!userId || !Array.isArray(itemIds) || itemIds.length < 1) {
      response.status(400).json({ error: "Missing checkout data" });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      response.status(400).json({ error: "Invalid amount" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: String(currency ?? "try").toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        itemIds: itemIds.map(String).join(","),
        customerEmail: customer?.email ?? "",
      },
    });

    response.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe payment-sheet error:", error);
    response.status(500).json({ error: "Unable to create payment intent" });
  }
});

app.listen(port, () => {
  console.log(`Stripe test server running on http://localhost:${port}`);
});
