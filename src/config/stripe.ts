export const stripeConfig = {
  publishableKey:
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    "pk_test_replace_with_your_key",
  paymentSheetEndpoint:
    process.env.EXPO_PUBLIC_PAYMENT_SHEET_ENDPOINT?.trim() ?? "",
  useStripePayments:
    process.env.EXPO_PUBLIC_USE_STRIPE_PAYMENTS?.trim().toLowerCase() ===
    "true",
  merchantDisplayName: "Smart E-Commerce",
};

export const isStripeConfigured =
  stripeConfig.useStripePayments &&
  !stripeConfig.publishableKey.includes("replace_with_your_key") &&
  stripeConfig.paymentSheetEndpoint.length > 0;
