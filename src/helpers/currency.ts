import * as Localization from "expo-localization";

export const SUPPORTED_CURRENCIES = ["TRY", "EUR", "USD", "RUB", "JPY"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_OPTIONS: Array<{
  code: SupportedCurrency;
  label: string;
}> = [
  { code: "TRY", label: "Turkish Lira" },
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "US Dollar" },
  { code: "RUB", label: "Russian Ruble" },
  { code: "JPY", label: "Japanese Yen" },
];

const EURO_REGIONS = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
]);

export const normalizeCurrency = (
  currency?: string | null,
): SupportedCurrency => {
  const upperCurrency = currency?.toUpperCase();
  return SUPPORTED_CURRENCIES.includes(upperCurrency as SupportedCurrency)
    ? (upperCurrency as SupportedCurrency)
    : "TRY";
};

export const getDefaultCurrency = (): SupportedCurrency => {
  const locale = Localization.getLocales()[0];
  const localeCurrency = locale?.currencyCode?.toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(localeCurrency as SupportedCurrency)) {
    return localeCurrency as SupportedCurrency;
  }

  const regionCode = locale?.regionCode?.toUpperCase();
  if (regionCode === "TR") {
    return "TRY";
  }
  if (regionCode === "RU") {
    return "RUB";
  }
  if (regionCode === "JP") {
    return "JPY";
  }
  if (regionCode && EURO_REGIONS.has(regionCode)) {
    return "EUR";
  }

  const languageCode = locale?.languageCode?.toLowerCase();
  if (languageCode === "tr") {
    return "TRY";
  }
  if (languageCode === "ru") {
    return "RUB";
  }
  if (languageCode === "ja") {
    return "JPY";
  }
  if (["de", "es", "fr", "it", "pt"].includes(languageCode ?? "")) {
    return "EUR";
  }

  return "USD";
};

export const formatPrice = (
  amount?: number | string | null,
  currency?: string | null,
) => {
  const numericAmount = Number(amount ?? 0);
  const formattedAmount = Number.isInteger(numericAmount)
    ? String(numericAmount)
    : numericAmount.toFixed(2);

  return `${formattedAmount} ${normalizeCurrency(currency)}`;
};
