import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { arrayRemove, arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const ORDER_NOTIFICATION_CHANNEL = "orders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let cachedExpoPushToken: string | null = null;

const getProjectId = () =>
  Constants.easConfig?.projectId ??
  Constants.expoConfig?.extra?.eas?.projectId;

const getExpoPushToken = async () => {
  if (cachedExpoPushToken) {
    return cachedExpoPushToken;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ORDER_NOTIFICATION_CHANNEL, {
      name: "Orders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let permissionStatus = currentPermissions.status;

  if (permissionStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    permissionStatus = requestedPermissions.status;
  }

  if (permissionStatus !== "granted") {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error("EAS project ID is missing; push token cannot be registered.");
  }

  cachedExpoPushToken = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  return cachedExpoPushToken;
};

export const registerPushNotificationsForCurrentUser = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return;
  }

  try {
    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      return;
    }

    await setDoc(
      doc(db, "users", userId),
      {
        expoPushTokens: arrayUnion(expoPushToken),
        pushTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    // A denied permission or an unavailable simulator must not block sign-in.
    console.warn("Push notification registration failed:", error);
  }
};

export const unregisterPushNotificationsForCurrentUser = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId || !cachedExpoPushToken) {
    return;
  }

  try {
    await setDoc(
      doc(db, "users", userId),
      {
        expoPushTokens: arrayRemove(cachedExpoPushToken),
        pushTokenUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn("Push notification unregistration failed:", error);
  }
};

export const orderNotificationChannelId = ORDER_NOTIFICATION_CHANNEL;
