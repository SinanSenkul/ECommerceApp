import { StyleSheet, View } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import ProfileSectionButton from "../../components/buttons/ProfileSectionButton";
import { sharedStyles } from "../../styles/sharedStyles";
import { RootState } from "../../store/store";
import { AppColors } from "../../styles/colors";
import { requireVerifiedUser } from "../../helpers/authGuards";
import { getSellerSaleNotifications } from "../../config/dataServices";
import { setSaleNotificationBadgeCount } from "../../services/saleNotificationBadgeService";
import { auth } from "../../config/firebase";

const DealsTabScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [pendingSaleApprovalCount, setPendingSaleApprovalCount] = useState(0);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
  };

  const loadPendingSaleApprovalState = useCallback(async () => {
    if (!auth.currentUser) {
      setPendingSaleApprovalCount(0);
      setSaleNotificationBadgeCount(0);
      return;
    }

    try {
      const saleNotifications = (await getSellerSaleNotifications()) as {
        status?: string;
      }[];
      const pendingCount = saleNotifications.filter(
        (notification) => notification.status !== "shipped",
      ).length;
      setPendingSaleApprovalCount(pendingCount);
      setSaleNotificationBadgeCount(pendingCount);
    } catch (error) {
      console.error("sale approval notification state could not be fetched: ", error);
      setPendingSaleApprovalCount(0);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadPendingSaleApprovalState();
    }, [loadPendingSaleApprovalState]),
  );

  const navigateIfVerified = async (routeName: string) => {
    const verifiedUser = await requireVerifiedUser(t);
    if (verifiedUser) {
      navigation.navigate(routeName);
    }
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader />
      <View style={styles.content}>
        <ProfileSectionButton
          title={t("My Orders")}
          onPress={() => navigateIfVerified("MyOrdersScreen")}
        />
        <ProfileSectionButton
          title={t("Sell Items")}
          onPress={() => navigateIfVerified("SellItemScreen")}
        />
        <ProfileSectionButton
          title={t("Your Items on Sale")}
          onPress={() => navigateIfVerified("ItemsOnSaleScreen")}
        />
        <ProfileSectionButton
          title={t("Orders Waiting Approval")}
          iconName={
            pendingSaleApprovalCount > 0
              ? "notifications"
              : "notifications-outline"
          }
          badgeCount={pendingSaleApprovalCount}
          onPress={() => navigateIfVerified("OrderApprovalScreen")}
        />
      </View>
    </AppSafeView>
  );
};

export default DealsTabScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
});
