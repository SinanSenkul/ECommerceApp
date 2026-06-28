# Stripe Payment Server

This server creates Stripe PaymentIntents for the React Native PaymentSheet and fulfills paid orders from Stripe webhooks.

The mobile app does not trust client totals or write paid orders directly. This server verifies the Firebase ID token, fetches product prices from Firestore, creates a pending checkout, and writes the order only after Stripe sends `payment_intent.succeeded`.

## Setup

1. Create a Stripe test account.
2. Copy `.env.example` to `.env`.
3. Set `STRIPE_SECRET_KEY`.
4. Set `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard or Stripe CLI.
5. Set Firebase Admin credentials with one of these options:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` as the full service-account JSON string.
   - `FIREBASE_SERVICE_ACCOUNT_KEY` as base64-encoded service-account JSON.
   - Google Application Default Credentials in the hosting environment.
6. Run:

```bash
npm install
npm start
```

The app should point `EXPO_PUBLIC_PAYMENT_SHEET_ENDPOINT` to:

```text
http://localhost:4242/payment-sheet
```

For a physical phone, replace `localhost` with your computer's LAN IP address.

## Local Webhook Testing

Use the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to localhost:4242/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Checkout Flow

1. App sends the Firebase ID token and selected item IDs to `/payment-sheet`.
2. Server verifies the token.
3. Server reads products from Firestore and calculates subtotal, tax, shipping, and currency.
4. Server creates `checkout_sessions/{checkoutId}` with `pending_payment`.
5. Server creates the Stripe PaymentIntent with `checkoutId` metadata.
6. App presents Stripe PaymentSheet.
7. Stripe calls `/webhook` after payment succeeds.
8. Server verifies the webhook signature.
9. Server creates the buyer order, seller notifications, and decrements stock in a Firestore transaction.

## Production Notes

- Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and Firebase service-account credentials only on the server.
- Do not expose service-account JSON in the Expo app.
- Configure a production Stripe webhook endpoint for `/webhook`.
- For high-volume inventory, add reservation expiry cleanup for abandoned PaymentIntents.
