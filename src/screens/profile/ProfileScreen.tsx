import { StyleSheet, View } from "react-native";
import React, { FC, useCallback, useEffect, useState } from "react";
import HomeHeader from "../../components/headers/HomeHeader";
import AppSafeView from "../../components/views/AppSafeView";
import ProfileSectionButton from "../../components/buttons/ProfileSectionButton";
import { sharedStyles } from "../../styles/sharedStyles";
import { vs } from "react-native-size-matters";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AppButton from "../../components/buttons/AppButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { auth } from "../../config/firebase";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged, signOut, getAuth, User } from "firebase/auth";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import ProfileScreenUnsub from "./ProfileScreenUnsub";
import { emptyItems } from "../../store/reducers/cartSlice";
import {
  switchLightMode,
  switchToDayMode,
} from "../../store/reducers/dayNightModeSlice";
import { requireVerifiedUser } from "../../helpers/authGuards";
import { getSellerSaleNotifications } from "../../config/dataServices";
import { setSaleNotificationBadgeCount } from "../../services/saleNotificationBadgeService";

interface IProfileScreen {
  username?: string;
}

const ProfileScreen: FC<IProfileScreen> = ({ username = "default" }) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch(); //redux
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [pendingSaleApprovalCount, setPendingSaleApprovalCount] = useState(0);
  const authInstance = getAuth();

  const { t } = useTranslation(); //localization

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#121212" : "#FFFFFF",
    textColor: isNight ? "#FFFFFF" : "#121212",
  };

  //animation to be added here later

  const handlePress = () => {
    dispatch(switchLightMode());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, setCurrentUser);
    return unsubscribe;
  }, [authInstance]);

  const loadPendingSaleApprovalState = useCallback(async () => {
    if (!authInstance.currentUser) {
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
  }, [authInstance]);

  useFocusEffect(
    useCallback(() => {
      loadPendingSaleApprovalState();
    }, [loadPendingSaleApprovalState]),
  );

  const LoggedOut = async () => {
    try {
      dispatch(emptyItems());
      dispatch(switchToDayMode());
      await signOut(authInstance);
    } catch (e) {
      console.error("logout error: ", e);
    }
  };

  const openDeviceLanguageSettings = async () => {
    if (Platform.OS === "ios") {
      try {
        // This is the current (2026) working deep link to Language & Region
        await Linking.openURL("App-Prefs:General&path=INTERNATIONAL");
      } catch (error) {
        console.error("Could not open Language & Region settings:", error);
        // Fallback: open the main Settings app
        await Linking.openSettings();
      }
    } else {
      Alert.alert(
        "Not available",
        "This feature currently works only on iPhone/iPad.",
      );
      return;
    }
  };

  const navigateIfVerified = async (routeName: string) => {
    const verifiedUser = await requireVerifiedUser(t);
    if (verifiedUser) {
      navigation.navigate(routeName);
    }
  };

  if (!currentUser) {
    return <ProfileScreenUnsub />;
  }

  return (
    <View style={styles.container}>
      <AppSafeView
        style={[
          styles.container,
          { backgroundColor: lightMode.backgroundColor },
        ]}
      >
        <HomeHeader />
        <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
          <ProfileSectionButton
            title={t("Profile Information")}
            onPress={() => navigateIfVerified("ProfileInfoScreen")}
          />
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
          <ProfileSectionButton
            title={t("Language")}
            onPress={() => {
              openDeviceLanguageSettings();
            }}
          />

          <ProfileSectionButton
            title={t("Log Out")}
            onPress={async () => {
              await LoggedOut();
              navigation.navigate("HomeScreen");
            }}
          />

          <ProfileSectionButton
            title={t("Delete Account")}
            onPress={() => {
              navigation.navigate("DeleteUserScreen");
            }}
          />
          <ProfileSectionButton
            title={isNight ? t("Day Mode") : t("Night Mode")}
            onPress={handlePress}
          />
        </View>

        <AppButton
          title={t("Back")}
          style={{ marginTop: vs(5) }}
          onPress={() => navigation.goBack()} 
        />
      </AppSafeView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
