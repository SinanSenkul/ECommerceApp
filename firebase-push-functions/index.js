const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const {
  getSellerOrderPushMessage,
} = require("./orderPushLocalization");

initializeApp();

const db = getFirestore();
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isExpoPushToken = (token) =>
  typeof token === "string" &&
  (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["));

const sendExpoPushNotifications = async (messages) => {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push service responded with HTTP ${response.status}`);
  }

  const body = await response.json();
  return Array.isArray(body.data) ? body.data : [];
};

exports.notifySellerOfSale = onDocumentCreated(
  "users/{sellerId}/saleNotifications/{saleNotificationId}",
  async (event) => {
    const sale = event.data?.data();
    const sellerId = event.params.sellerId;
    if (!sale) {
      logger.warn("Sale notification trigger received no document data.");
      return;
    }

    const sellerSnapshot = await db.doc(`users/${sellerId}`).get();
    const tokens = sellerSnapshot.exists
      ? sellerSnapshot.get("expoPushTokens")
      : [];
    const validTokens = Array.isArray(tokens) ? tokens.filter(isExpoPushToken) : [];

    if (validTokens.length === 0) {
      logger.info("Seller has no registered push tokens.", { sellerId });
      return;
    }

    const pushMessage = getSellerOrderPushMessage({
      language: sellerSnapshot.exists
        ? sellerSnapshot.get("pushNotificationLanguage")
        : "en",
      buyerName: sale.buyerName,
      productName: sale.productName,
    });
    const messages = validTokens.map((to) => ({
      to,
      title: pushMessage.title,
      body: pushMessage.body,
      sound: "default",
      priority: "high",
      channelId: "orders",
      data: {
        screen: "OrderApprovalScreen",
        saleNotificationId: event.params.saleNotificationId,
        orderId: sale.orderId ?? "",
      },
    }));

    const tickets = await sendExpoPushNotifications(messages);
    const invalidTokens = tickets.flatMap((ticket, index) =>
      ticket?.details?.error === "DeviceNotRegistered" ? [validTokens[index]] : [],
    );

    if (invalidTokens.length > 0) {
      await sellerSnapshot.ref.update({
        expoPushTokens: FieldValue.arrayRemove(...invalidTokens),
      });
    }

    logger.info("Seller order push sent.", {
      sellerId,
      saleNotificationId: event.params.saleNotificationId,
      recipientCount: validTokens.length,
    });
  },
);
