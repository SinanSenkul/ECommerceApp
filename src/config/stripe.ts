export const stripeConfig = {
  publishableKey: "pk_test_51TeUoxRZ8hw3GQPTnq6uOy71krwTdEcoNNrb88UUVkNDO99gRbHZf05jcvHnNHP0MvGph0F6nxWBFzxl1BHw6sLO00wvTCEWBw",
  paymentSheetEndpoint: "http://192.168.1.34:4242/payment-sheet",
  useStripePayments: true,
  merchantDisplayName: "Smart E-Commerce",
};

export const isStripeConfigured =
  stripeConfig.useStripePayments &&
  !stripeConfig.publishableKey.includes("replace_with_your_key") &&
  stripeConfig.paymentSheetEndpoint.length > 0;
