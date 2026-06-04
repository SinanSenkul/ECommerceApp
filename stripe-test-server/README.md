# Stripe Test Server

This local server creates Stripe test-mode PaymentIntents for the React Native PaymentSheet.

## Setup

1. Create a Stripe test account.
2. Copy `.env.example` to `.env`.
3. Put your test secret key in `.env`.
4. Run:

```bash
npm install
npm start
```

The app expects the server at `http://localhost:4242/payment-sheet` by default.

For a physical phone, replace `localhost` in `src/config/stripe.ts` with your computer's LAN IP address, for example `http://192.168.1.25:4242/payment-sheet`.

## Important

This is an educational test server. A production backend should fetch products and prices from the database, validate stock server-side, create the order from a webhook, and never trust totals sent by the mobile app.
