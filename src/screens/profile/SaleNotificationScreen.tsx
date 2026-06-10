import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import { s, vs } from "react-native-size-matters";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import AppText from "../../components/texts/AppText";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { sharedStyles } from "../../styles/sharedStyles";
import { RootState } from "../../store/store";
import {
  getSellerSaleNotifications,
  markSaleNotificationOrderAsShipped,
} from "../../config/dataServices";
import { useTranslation } from "react-i18next";

interface SaleNotification {
  id: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerId?: string;
  productName?: string;
  productPrice?: number;
  orderId?: string;
  userOrderId?: string;
  status?: "unread" | "shipped";
  createDate?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  };
}

const getNotificationTime = (notification: SaleNotification) => {
  if (typeof notification.createdAt?.seconds === "number") {
    return (
      notification.createdAt.seconds * 1000 +
      Math.floor((notification.createdAt.nanoseconds ?? 0) / 1000000)
    );
  }

  if (notification.createDate) {
    const [day, month, year] = notification.createDate.split(".").map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day).getTime();
    }
  }

  return 0;
};

const SaleNotificationScreen = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<SaleNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingNotificationId, setUpdatingNotificationId] = useState<
    string | null
  >(null);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.blueGray,
    mutedTextColor: isNight ? AppColors.blueGray : AppColors.medGray,
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const saleNotifications =
        (await getSellerSaleNotifications()) as SaleNotification[];
      const sortedNotifications = saleNotifications.sort(
        (firstNotification, secondNotification) =>
          getNotificationTime(secondNotification) -
          getNotificationTime(firstNotification),
      );
      setNotifications(sortedNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const markAsShipped = async (notification: SaleNotification) => {
    if (
      !notification.buyerId ||
      !notification.userOrderId ||
      !notification.orderId
    ) {
      showMessage({
        message: t("Order update failed"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
      });
      return;
    }

    try {
      setUpdatingNotificationId(notification.id);
      await markSaleNotificationOrderAsShipped({
        notificationId: notification.id,
        buyerId: notification.buyerId,
        userOrderId: notification.userOrderId,
        orderId: notification.orderId,
      });
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? { ...currentNotification, status: "shipped" }
            : currentNotification,
        ),
      );
      showMessage({
        message: t("Order marked as shipped"),
        type: "success",
        duration: 1200,
        floating: true,
        icon: "success",
      });
    } catch (error) {
      console.error("order status update failed: ", error);
      showMessage({
        message: t("Order update failed"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
      });
    } finally {
      setUpdatingNotificationId(null);
    }
  };

  const renderItem = ({ item }: { item: SaleNotification }) => {
    const isShipped = item.status === "shipped";
    const isUpdating = updatingNotificationId === item.id;

    return (
    <View
      style={[
        styles.notificationContainer,
        {
          backgroundColor: lightMode.surfaceColor,
          borderColor: lightMode.borderColor,
        },
      ]}
    >
      <View style={styles.notificationHeader}>
        <AppText style={styles.message}>
          {t("Sale Alert Message", {
            buyerName: item.buyerName || t("Buyer"),
            productName: item.productName || t("Product"),
          })}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={isShipped || isUpdating}
          onPress={() => markAsShipped(item)}
          style={[
            styles.shipButton,
            {
              borderColor: isShipped ? AppColors.medGray : AppColors.primary,
              opacity: isUpdating ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons
            name="checkmark-outline"
            size={s(20)}
            color={isShipped ? AppColors.medGray : AppColors.primary}
          />
        </TouchableOpacity>
      </View>
      <AppText style={styles.text}>
        {t("Buyer:")} {item.buyerName || "-"}
      </AppText>
      <AppText style={styles.text}>
        {t("Email:")} {item.buyerEmail || "-"}
      </AppText>
      <AppText style={styles.text}>
        {t("Product:")} {item.productName || "-"}
      </AppText>
      <AppText style={styles.text}>
        {t("Price:")} {item.productPrice ?? 0} ₺
      </AppText>
      <AppText style={styles.text}>
        {t("Status:")} {isShipped ? t("Shipped") : t("Ordered")}
      </AppText>
      {item.createDate && (
        <AppText style={[styles.text, { color: lightMode.mutedTextColor }]}>
          {t("Date:")} {item.createDate}
        </AppText>
      )}
    </View>
    );
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader showBackButton />
      <View style={styles.content}>
        <AppText style={styles.title}>{t("Sale Notifications")}</AppText>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={isNight ? AppColors.white : AppColors.black}
            style={styles.loading}
          />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>
                {t("You do not have any sale notifications")}
              </AppText>
            }
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default SaleNotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  title: {
    fontFamily: AppFonts.Bold,
    fontSize: s(18),
    marginVertical: vs(12),
    textAlign: "center",
  },
  listContent: {
    paddingBottom: vs(24),
  },
  notificationContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: s(8),
    padding: s(12),
    marginBottom: vs(10),
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: s(10),
    marginBottom: vs(8),
  },
  message: {
    flex: 1,
    fontFamily: AppFonts.Bold,
    fontSize: s(15),
  },
  shipButton: {
    height: s(34),
    width: s(34),
    borderRadius: s(17),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: AppFonts.Medium,
    fontSize: s(14),
    marginVertical: vs(2),
  },
  emptyText: {
    textAlign: "center",
    marginTop: vs(24),
  },
  loading: {
    marginTop: vs(24),
  },
});
