import { createStripePayment } from "../paymentService";

const fetchMock = jest.fn();

Object.defineProperty(global, "fetch", {
  value: fetchMock,
  writable: true,
});

describe("createStripePayment", () => {
  const baseParams = {
    amount: 125,
    currency: "EUR",
    itemIds: ["product-1", "product-2"],
    userId: "buyer-1",
    authToken: "firebase-token",
    fullName: "Sinan Senkul",
    emailAddress: "sinan@example.com",
    detailedAddress: "A long enough checkout address",
    endpoint: "https://example.com/payment-sheet",
    merchantDisplayName: "Smart E-Commerce",
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  };

  beforeEach(() => {
    fetchMock.mockReset();
    baseParams.initPaymentSheet.mockReset();
    baseParams.presentPaymentSheet.mockReset();
    baseParams.initPaymentSheet.mockResolvedValue({});
    baseParams.presentPaymentSheet.mockResolvedValue({});
  });

  it("requests a server-owned PaymentIntent with auth and item ids", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        paymentIntentClientSecret: "pi_secret",
        paymentIntentId: "pi_123",
        amount: 135,
        currency: "EUR",
      }),
    });

    const result = await createStripePayment(baseParams);

    expect(fetchMock).toHaveBeenCalledWith(baseParams.endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer firebase-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemIds: ["product-1", "product-2"],
        customer: {
          name: "Sinan Senkul",
          email: "sinan@example.com",
          detailedAddress: "A long enough checkout address",
        },
      }),
    });
    expect(baseParams.initPaymentSheet).toHaveBeenCalledWith({
      merchantDisplayName: "Smart E-Commerce",
      paymentIntentClientSecret: "pi_secret",
      defaultBillingDetails: {
        name: "Sinan Senkul",
        email: "sinan@example.com",
      },
    });
    expect(baseParams.presentPaymentSheet).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: "pi_123",
      amount: 135,
      currency: "EUR",
      provider: "stripe",
      status: "succeeded",
    });
  });

  it("throws when payment setup fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(createStripePayment(baseParams)).rejects.toThrow(
      "Stripe payment setup failed",
    );
  });

  it("throws when PaymentSheet presentation fails", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        paymentIntentClientSecret: "pi_secret",
        paymentIntentId: "pi_123",
      }),
    });
    baseParams.presentPaymentSheet.mockResolvedValue({
      error: { message: "Card declined" },
    });

    await expect(createStripePayment(baseParams)).rejects.toThrow(
      "Card declined",
    );
  });
});
