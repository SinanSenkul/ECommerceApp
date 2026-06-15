import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const countPendingSaleNotifications = (
  docs: { data: () => { status?: string } }[],
) =>
  docs.filter((notificationDoc) => notificationDoc.data().status !== "shipped")
    .length;

const requestBadgePermission = async () => {
  try {
    const currentPermissions = await Notifications.getPermissionsAsync();
    if (
      currentPermissions.granted &&
      currentPermissions.ios?.allowsBadge !== false
    ) {
      return true;
    }

    if (currentPermissions.status === "denied") {
      return false;
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: false,
        allowBadge: true,
        allowSound: false,
      },
    });

    return (
      requestedPermissions.granted ||
      requestedPermissions.ios?.allowsBadge === true
    );
  } catch (error) {
    console.error("badge permission could not be requested: ", error);
    return false;
  }
};

export const setSaleNotificationBadgeCount = async (count: number) => {
  try {
    const safeCount = Math.max(0, count);
    if (safeCount > 0) {
      const canSetBadge = await requestBadgePermission();
      if (!canSetBadge) {
        return false;
      }
    }

    return Notifications.setBadgeCountAsync(safeCount);
  } catch (error) {
    console.error("sale notification badge could not be updated: ", error);
    return false;
  }
};

export const syncSaleNotificationBadgeCount = async () => {
  const sellerId = auth.currentUser?.uid;
  if (!sellerId) {
    await setSaleNotificationBadgeCount(0);
    return 0;
  }

  try {
    const saleNotificationsRef = collection(
      doc(db, "users", sellerId),
      "saleNotifications",
    );
    const snapshot = await getDocs(saleNotificationsRef);
    const pendingCount = countPendingSaleNotifications(snapshot.docs);
    await setSaleNotificationBadgeCount(pendingCount);
    return pendingCount;
  } catch (error) {
    console.error("sale notification badge count could not be synced: ", error);
    return 0;
  }
};

export const subscribeToSaleNotificationBadgeUpdates = (
  onPendingCountChange?: (pendingCount: number) => void,
) => {
  let unsubscribeFromSaleNotifications: Unsubscribe | undefined;

  const unsubscribeFromAuth = onAuthStateChanged(auth, (user) => {
    unsubscribeFromSaleNotifications?.();

    if (!user) {
      onPendingCountChange?.(0);
      setSaleNotificationBadgeCount(0);
      return;
    }

    const saleNotificationsRef = collection(
      doc(db, "users", user.uid),
      "saleNotifications",
    );

    unsubscribeFromSaleNotifications = onSnapshot(
      saleNotificationsRef,
      (snapshot) => {
        const pendingCount = countPendingSaleNotifications(snapshot.docs);
        onPendingCountChange?.(pendingCount);
        setSaleNotificationBadgeCount(pendingCount);
      },
      (error) => {
        console.error("sale notification badge listener failed: ", error);
      },
    );
  });

  return () => {
    unsubscribeFromSaleNotifications?.();
    unsubscribeFromAuth();
  };
};

export const subscribeToActiveAppBadgeSync = () => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      syncSaleNotificationBadgeCount();
    }
  };

  const subscription = AppState.addEventListener("change", handleAppStateChange);
  return () => subscription.remove();
};
