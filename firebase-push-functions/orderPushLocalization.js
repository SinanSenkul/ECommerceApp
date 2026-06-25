const SELLER_ORDER_PUSH_MESSAGES = {
  en: {
    title: "New order received",
    buyerFallback: "A buyer",
    productFallback: "your product",
    body: (buyerName, productName) => `${buyerName} ordered ${productName}.`,
  },
  tr: {
    title: "Yeni sipariş alındı",
    buyerFallback: "Bir alıcı",
    productFallback: "ürününüzü",
    body: (buyerName, productName) => `${buyerName}, ${productName} sipariş etti.`,
  },
  es: {
    title: "Nuevo pedido recibido",
    buyerFallback: "Un comprador",
    productFallback: "tu producto",
    body: (buyerName, productName) => `${buyerName} ha pedido ${productName}.`,
  },
  de: {
    title: "Neue Bestellung erhalten",
    buyerFallback: "Ein Käufer",
    productFallback: "dein Produkt",
    body: (buyerName, productName) => `${buyerName} hat ${productName} bestellt.`,
  },
  it: {
    title: "Nuovo ordine ricevuto",
    buyerFallback: "Un acquirente",
    productFallback: "il tuo prodotto",
    body: (buyerName, productName) => `${buyerName} ha ordinato ${productName}.`,
  },
  fr: {
    title: "Nouvelle commande reçue",
    buyerFallback: "Un acheteur",
    productFallback: "votre produit",
    body: (buyerName, productName) => `${buyerName} a commandé ${productName}.`,
  },
  ru: {
    title: "Получен новый заказ",
    buyerFallback: "Покупатель",
    productFallback: "ваш товар",
    body: (buyerName, productName) => `${buyerName} заказал(а) ${productName}.`,
  },
  pt: {
    title: "Novo pedido recebido",
    buyerFallback: "Um comprador",
    productFallback: "seu produto",
    body: (buyerName, productName) => `${buyerName} pediu ${productName}.`,
  },
};

const normalizeOrderPushLanguage = (language) => {
  const languageCode =
    typeof language === "string" ? language.split("-")[0] : "en";

  return Object.prototype.hasOwnProperty.call(
    SELLER_ORDER_PUSH_MESSAGES,
    languageCode,
  )
    ? languageCode
    : "en";
};

const getNonEmptyString = (value, fallback) =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const getSellerOrderPushMessage = ({ language, buyerName, productName }) => {
  const messageTemplate =
    SELLER_ORDER_PUSH_MESSAGES[normalizeOrderPushLanguage(language)];
  const resolvedBuyerName = getNonEmptyString(
    buyerName,
    messageTemplate.buyerFallback,
  );
  const resolvedProductName = getNonEmptyString(
    productName,
    messageTemplate.productFallback,
  );

  return {
    title: messageTemplate.title,
    body: messageTemplate.body(resolvedBuyerName, resolvedProductName),
  };
};

module.exports = {
  getSellerOrderPushMessage,
};
