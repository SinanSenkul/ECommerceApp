import * as Localization from "expo-localization";
import {
  formatPrice,
  getDefaultCurrency,
  normalizeCurrency,
} from "../currency";

jest.mock("expo-localization", () => ({
  getLocales: jest.fn(),
}));

const mockGetLocales = Localization.getLocales as jest.Mock;

describe("currency helpers", () => {
  beforeEach(() => {
    mockGetLocales.mockReset();
  });

  it("normalizes supported currency codes and falls back to TRY", () => {
    expect(normalizeCurrency("eur")).toBe("EUR");
    expect(normalizeCurrency("JPY")).toBe("JPY");
    expect(normalizeCurrency("cad")).toBe("TRY");
    expect(normalizeCurrency()).toBe("TRY");
  });

  it("formats prices with the normalized currency code", () => {
    expect(formatPrice(15, "usd")).toBe("15 USD");
    expect(formatPrice(15.5, "eur")).toBe("15.50 EUR");
    expect(formatPrice(null, "unknown")).toBe("0 TRY");
  });

  it("uses the device currency code when supported", () => {
    mockGetLocales.mockReturnValue([{ currencyCode: "JPY", regionCode: "US" }]);

    expect(getDefaultCurrency()).toBe("JPY");
  });

  it("falls back through region and language before defaulting to USD", () => {
    mockGetLocales.mockReturnValue([{ regionCode: "DE", languageCode: "en" }]);
    expect(getDefaultCurrency()).toBe("EUR");

    mockGetLocales.mockReturnValue([{ languageCode: "tr" }]);
    expect(getDefaultCurrency()).toBe("TRY");

    mockGetLocales.mockReturnValue([{ languageCode: "ko", regionCode: "KR" }]);
    expect(getDefaultCurrency()).toBe("USD");
  });
});
