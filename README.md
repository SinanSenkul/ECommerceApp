# Smart E-Commerce

Smart E-Commerce is a mobile marketplace app built with Expo and React Native. Users can browse products, add items to a cart, buy through Stripe PaymentSheet, sell their own items, and manage deal activity from a dedicated Deals tab.

## Features

- Firebase email/password authentication with email verification guards
- Product browsing, search, detail pages, and image galleries
- Cart with duplicate-item, self-purchase, and mixed-currency protection
- Seller listings with image upload, stock quantity, and currency selection
- Supported listing currencies: TRY, EUR, USD, RUB, and JPY
- Device-locale currency defaults, with TRY fallback for older listings
- Select-style currency picker for listing items
- Deals tab for My Orders, Sell Items, Your Items on Sale, and Orders Waiting Approval
- Seller order approval workflow with sale notifications and shipped status
- Stripe PaymentSheet checkout with backend-side price, stock, and user validation
- Webhook-based order fulfillment after successful Stripe payment
- Push notification registration and sale notification badge sync
- Firebase Crashlytics breadcrumbs and non-fatal reporting around auth, checkout, product listing, and seller order approval
- Jest coverage for currency helpers, cart reducer behavior, and payment service request/error handling
- Localized UI across English, Turkish, Spanish, German, Italian, French, Russian, and Portuguese

## Tech Stack

- Expo SDK 54, React 19, React Native 0.81, TypeScript
- Expo Development Client for native-device testing
- React Navigation, Redux Toolkit, Redux Persist
- Firebase Auth and Cloud Firestore
- React Native Firebase Crashlytics
- Stripe React Native and a Node/Express payment server
- React Hook Form, Yup, i18next
- Jest and jest-expo

## Project Structure

```text
src/
  components/      Shared UI components
  config/          Firebase, Stripe, and data service helpers
  helpers/         Auth, date, and currency helpers
  localization/    Translation files and i18n setup
  navigation/      Stack and bottom-tab navigation
  screens/         Auth, home, cart, deals, profile, seller, and order screens
  services/        Crashlytics, payment, push, and sale-notification services
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

## Crash Reporting

Crashlytics is wired through React Native Firebase. The app records automatic native/JavaScript crashes, syncs the current Firebase UID with Crashlytics, and adds breadcrumbs/non-fatal errors around risky flows such as sign-in, sign-up, checkout, product listing, and order approval.

Native Firebase config files are required before creating a new EAS build:

```text
GoogleService-Info.plist
google-services.json
```

These files come from Firebase Console and must match the app identifiers in `app.json`.

## Getting Started

Install app dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Start Expo for the development build:

```bash
npx expo start --dev-client --host lan
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
npm test
npm run test:watch
```

## Testing Notes

Because Stripe React Native and push notifications use native behavior, realistic device testing should use a development build or TestFlight/internal Android build rather than Expo Go. For physical devices, the payment endpoint must be reachable from the device, usually through a public HTTPS backend or tunnel.

Crashlytics is also native, so it requires a fresh development or production build after the Firebase native config files are added.

Run unit tests:

```bash
npm test
```

Current Jest coverage focuses on core app logic: currency fallback/formatting, cart normalization and duplicate handling, and Stripe PaymentSheet setup/error paths.

## Author

Sinan Senkul  
GitHub: [SinanSenkul](https://github.com/SinanSenkul)
