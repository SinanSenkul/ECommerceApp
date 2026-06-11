# Smart E-Commerce

Smart E-Commerce is a mobile marketplace app built with Expo and React Native. Users can browse products, view product details, add items to a cart, pay through Stripe PaymentSheet, manage their profile, sell their own items, and track order status.

## Features

- Email/password authentication with Firebase Auth
- Persistent signed-in sessions using Firebase auth state and local storage
- Product browsing with detail modal screens
- Cart management with duplicate-item and self-purchase protection
- Stripe PaymentSheet checkout flow
- Firestore-backed order history
- Order statuses: `ordered` and `shipped`
- Buyer order list with product name, status, total price, and order date
- Seller product listing with image upload, price, and stock quantity
- Seller item management for active listings
- Sale notifications when a buyer orders a seller's product
- Seller action to mark an order as shipped
- Profile information editing: name, address, and password
- Localized validation, Firebase, payment, order, and seller workflow messages
- Supported languages: English, Turkish, Spanish, German, Italian, French, Russian, and Portuguese
- English fallback for unsupported languages

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- TypeScript
- React Navigation
- Redux Toolkit and Redux Persist
- Firebase Auth
- Cloud Firestore
- Stripe React Native
- React Hook Form
- Yup
- i18next and react-i18next
- Expo Image Picker

## Project Structure

```text
src/
  components/      Shared UI components
  config/          Firebase, Stripe, and data service helpers
  localization/    Translation files and i18n setup
  navigation/      Stack and tab navigation
  screens/         Auth, cart, home, profile, seller, and language screens
  services/        Payment service logic
  store/           Redux slices and store setup
  styles/          Shared colors, fonts, and layout styles
stripe-test-server/
  server.js        Test-mode Stripe PaymentSheet backend
```

## Localization

The app currently includes these languages:

- English (`en`)
- Turkish (`tr`)
- Spanish (`es`)
- German (`de`)
- Italian (`it`)
- French (`fr`)
- Russian (`ru`)
- Portuguese (`pt`)

Translations live in `src/localization`. The app uses English as the fallback language when a requested language is not supported.

## Payments

The app uses Stripe PaymentSheet. The mobile app needs a publishable key and a public HTTPS backend endpoint that creates PaymentSheet data.

Required Expo public environment variables:

```env
EXPO_PUBLIC_USE_STRIPE_PAYMENTS=true
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
EXPO_PUBLIC_PAYMENT_SHEET_ENDPOINT=https://your-payment-server.example.com/payment-sheet
```

For local testing, the repository includes `stripe-test-server`, a small Node/Express backend for Stripe test-mode PaymentIntents. Do not commit secret keys. Keep Stripe secret keys only in local or hosted backend environment variables.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

## Stripe Test Server

From the `stripe-test-server` folder:

```bash
npm install
npm start
```

The server expects:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
PORT=4242
```

For real device testing or App Store review, the PaymentSheet endpoint must be available over public HTTPS.

## Firebase

Firebase is used for:

- Authentication
- User profile data
- Products on sale
- User carts
- Orders
- Sale notifications

Firebase configuration is in `src/config/firebase.ts`.

## Scripts

```bash
npm start        # Start Expo
npm run android  # Build/run Android
npm run ios      # Build/run iOS
npm run web      # Start Expo web
```

## Current Notes

- The app is configured for portrait orientation.
- iOS bundle identifier: `com.anonymous.ecommerceapp`
- Android package: `com.anonymous.ecommerceapp`
- App version in Expo config: `1.0.2`
- Some TypeScript navigation typing cleanup is still pending in older screens.

## Author

Sinan Senkul  
GitHub: [SinanSenkul](https://github.com/SinanSenkul)
