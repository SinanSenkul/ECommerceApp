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
  fullName: string;
  emailAddress: string;
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
  fullName,
  emailAddress,
  endpoint,
  merchantDisplayName,
  initPaymentSheet,
  presentPaymentSheet,
}: StripePaymentParams): Promise<PaymentResult> => {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        itemIds,
        userId,
        customer: {
          name: fullName,
          email: emailAddress,
        },
      }),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("Stripe test endpoint unavailable, using mock payment.", error);
      return createMockPayment({
        amount,
        currency,
        itemCount: itemIds.length,
        userId,
      });
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error("Stripe payment setup failed");
  }

  const paymentSheet = (await response.json()) as {
    paymentIntentClientSecret?: string;
    paymentIntentId?: string;
  };

  if (!paymentSheet.paymentIntentClientSecret) {
    throw new Error("Stripe payment setup failed");
  }

  const { error: initError } = await initPaymentSheet({
    merchantDisplayName,
    paymentIntentClientSecret: paymentSheet.paymentIntentClientSecret,
    defaultBillingDetails: {
      name: fullName,
      email: emailAddress,
    },
  });

  if (initError) {
    throw new Error(initError.message ?? "Stripe payment setup failed");
  }

  const { error: paymentError } = await presentPaymentSheet();

  if (paymentError) {
    throw new Error(paymentError.message ?? "Stripe payment failed");
  }

  return {
    id: paymentSheet.paymentIntentId ?? `stripe_${Date.now()}`,
    amount,
    currency,
    paidAt: new Date().toISOString(),
    provider: "stripe",
    status: "succeeded",
  };
};
