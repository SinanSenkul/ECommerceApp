# Smart E-Commerce

Smart E-Commerce is a mobile marketplace app built with Expo and React Native. Users can browse products, add items to a cart, buy through Stripe PaymentSheet, sell their own items, and manage deal activity from a dedicated Deals tab.

## Features

- Firebase email/password authentication with email verification guards
- Product browsing, search, detail pages, and image galleries
- Cart with duplicate-item, self-purchase, and mixed-currency protection
- Seller listings with image upload, stock quantity, and currency selection
- Supported listing currencies: TRY, EUR, USD, RUB, and JPY
- Device-locale currency defaults, with TRY fallback for older listings
- Deals tab for My Orders, Sell Items, Your Items on Sale, and Orders Waiting Approval
- Seller order approval workflow with sale notifications and shipped status
- Stripe PaymentSheet checkout with backend-side price, stock, and user validation
- Webhook-based order fulfillment after successful Stripe payment
- Localized UI across English, Turkish, Spanish, German, Italian, French, Russian, and Portuguese

## Tech Stack

- Expo SDK 54, React 19, React Native 0.81, TypeScript
- React Navigation, Redux Toolkit, Redux Persist
- Firebase Auth and Cloud Firestore
- Stripe React Native and a Node/Express payment server
- React Hook Form, Yup, i18next

## Project Structure

```text
src/
  components/      Shared UI components
  config/          Firebase, Stripe, and data service helpers
  helpers/         Auth, date, and currency helpers
  localization/    Translation files and i18n setup
  navigation/      Stack and bottom-tab navigation
  screens/         Auth, home, cart, deals, profile, seller, and order screens
  services/        Payment, push, and sale-notification services
  store/           Redux slices and persisted store setup
stripe-test-server/
  server.js        Stripe PaymentSheet and webhook fulfillment backend
```

## Payments

Checkout is backend-owned. The app sends a Firebase ID token and item IDs to `/payment-sheet`; the server verifies the user, reads Firestore products, calculates the total, creates a Stripe PaymentIntent, and fulfills the order from Stripe's `payment_intent.succeeded` webhook.

Required Expo public environment variables:

```env
EXPO_PUBLIC_USE_STRIPE_PAYMENTS=true
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
EXPO_PUBLIC_PAYMENT_SHEET_ENDPOINT=https://your-payment-server.com/payment-sheet
```

Payment server environment variables:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id"}
CHECKOUT_TAX_AMOUNT=15
CHECKOUT_SHIPPING_FEE=10
PORT=4242
```

For local webhook testing:

```bash
stripe listen --forward-to localhost:4242/webhook
```

## Getting Started

Install app dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Run the payment server:

```bash
cd stripe-test-server
npm install
npm start
```

Useful app scripts:

```bash
npm run android
npm run ios
npm run web
```

## Testing Notes

Because Stripe React Native uses native code, realistic payment testing should use a development build or TestFlight/internal Android build rather than Expo Go. For physical devices, the payment endpoint must be reachable from the device, usually through a public HTTPS backend or tunnel.

## Author

Sinan Senkul  
GitHub: [SinanSenkul](https://github.com/SinanSenkul)
