import {
  logCrashlyticsBreadcrumb,
  recordCrashlyticsError,
} from "./crashlyticsService";

interface MockPaymentParams {
  amount: number;
  currency: string;
  itemCount: number;
  userId: string;
}

export interface PaymentResult {
  id: string;
  amount: number;
  currency: string;
  paidAt: string;
  provider: "mock" | "stripe";
  status: "succeeded";
}

interface StripePaymentParams {
  amount: number;
  currency: string;
  itemIds: Array<number | string>;
  userId: string;
  authToken: string;
  fullName: string;
  emailAddress: string;
  detailedAddress: string;
  endpoint: string;
  merchantDisplayName: string;
  initPaymentSheet: (params: {
    merchantDisplayName: string;
    paymentIntentClientSecret: string;
    returnURL?: string;
    defaultBillingDetails?: {
      name?: string;
      email?: string;
    };
  }) => Promise<{ error?: { message?: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { message?: string } }>;
}

const MOCK_PAYMENT_DELAY_MS = 1200;

export const createMockPayment = async ({
  amount,
  currency,
  itemCount,
  userId,
}: MockPaymentParams): Promise<PaymentResult> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_PAYMENT_DELAY_MS));

  if (!userId || itemCount < 1 || amount <= 0) {
    throw new Error("Mock payment failed");
  }

  return {
    id: `mock_${Date.now()}`,
    amount,
    currency,
    paidAt: new Date().toISOString(),
    provider: "mock",
    status: "succeeded",
  };
};

export const createStripePayment = async ({
  amount,
  currency,
  itemIds,
  userId,
  authToken,
  fullName,
  emailAddress,
  detailedAddress,
  endpoint,
  merchantDisplayName,
  initPaymentSheet,
  presentPaymentSheet,
}: StripePaymentParams): Promise<PaymentResult> => {
  const paymentAttributes = {
    currency,
    item_count: itemIds.length,
    payment_provider: "stripe",
  };

  logCrashlyticsBreadcrumb("payment_sheet_requested", paymentAttributes);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemIds,
        customer: {
          name: fullName,
          email: emailAddress,
          detailedAddress,
        },
      }),
    });
  } catch (error) {
    logCrashlyticsBreadcrumb("payment_sheet_backend_unavailable", {
      ...paymentAttributes,
      dev_mock_fallback: __DEV__,
    });

    if (__DEV__) {
      console.warn("Stripe test endpoint unavailable, using mock payment.", error);
      return createMockPayment({
        amount,
        currency,
        itemCount: itemIds.length,
        userId,
      });
    }

    recordCrashlyticsError(error, "payment_sheet_backend_unavailable", paymentAttributes);
    throw error;
  }

  if (!response.ok) {
    const setupError = new Error("Stripe payment setup failed");
    recordCrashlyticsError(setupError, "payment_sheet_backend_rejected", {
      ...paymentAttributes,
      status_code: response.status,
    });
    throw setupError;
  }

  const paymentSheet = (await response.json()) as {
    paymentIntentClientSecret?: string;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
  };

  if (!paymentSheet.paymentIntentClientSecret) {
    const setupError = new Error("Stripe payment setup failed");
    recordCrashlyticsError(setupError, "payment_sheet_missing_client_secret", paymentAttributes);
    throw setupError;
  }

  logCrashlyticsBreadcrumb("payment_sheet_response_received", paymentAttributes);

  const { error: initError } = await initPaymentSheet({
    merchantDisplayName,
    paymentIntentClientSecret: paymentSheet.paymentIntentClientSecret,
    defaultBillingDetails: {
      name: fullName,
      email: emailAddress,
    },
  });

  if (initError) {
    const setupError = new Error(initError.message ?? "Stripe payment setup failed");
    recordCrashlyticsError(setupError, "payment_sheet_init_failed", paymentAttributes);
    throw setupError;
  }

  logCrashlyticsBreadcrumb("payment_sheet_opened", paymentAttributes);
  const { error: paymentError } = await presentPaymentSheet();

  if (paymentError) {
    const stripeError = new Error(paymentError.message ?? "Stripe payment failed");
    recordCrashlyticsError(stripeError, "payment_sheet_present_failed", paymentAttributes);
    throw stripeError;
  }

  logCrashlyticsBreadcrumb("payment_sheet_succeeded", paymentAttributes);

  return {
    id: paymentSheet.paymentIntentId ?? `stripe_${Date.now()}`,
    amount: paymentSheet.amount ?? amount,
    currency: paymentSheet.currency ?? currency,
    paidAt: new Date().toISOString(),
    provider: "stripe",
    status: "succeeded",
  };
};
