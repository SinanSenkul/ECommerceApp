# Seller order push notifications

When checkout writes `users/{sellerId}/saleNotifications/{saleNotificationId}`, the `notifySellerOfSale` Firebase Cloud Function sends a remote push to every registered seller device. The buyer never sends notifications directly.

The app uses Expo's push service. It uses FCM for Android delivery and APNs for iOS delivery, while giving the app one token format and one server implementation.

## One-time Firebase/EAS setup

1. In Firebase, enable Cloud Messaging for project `smart-e-commerce-app-249a0`.
2. In EAS credentials, upload the Firebase Cloud Messaging v1 service-account key for Android. For iOS, configure an APNs key/certificate in EAS credentials.
3. Install the Functions dependencies and deploy the trigger:

   ```bash
   npm --prefix firebase-push-functions install
   npm install -g firebase-tools
   firebase login
   firebase deploy --only functions
   ```

4. Build an EAS development or production build. Remote notifications do not work in Expo Go.

## Test

1. Sign in as a seller and allow notifications; the app stores an Expo token on the seller's `users/{uid}` Firestore document.
2. On another device/account, buy one of that seller's products.
3. Confirm the seller receives **New order received**, including while the app is backgrounded.

The Cloud Function removes tokens that Expo reports as `DeviceNotRegistered`.
