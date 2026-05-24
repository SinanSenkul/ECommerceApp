import { StyleSheet, Text, View } from "react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import HomeHeader from "../../components/headers/HomeHeader";
import AppSafeView from "../../components/views/AppSafeView";
import ProfileSectionButton from "../../components/buttons/ProfileSectionButton";
import { sharedStyles } from "../../styles/sharedStyles";
import AppText from "../../components/texts/AppText";
import { s, vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../components/buttons/AppButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { auth } from "../../config/firebase";
import { useTranslation } from "react-i18next";
import { deleteUserData } from "../../store/reducers/userSlice";
import { signOut, getAuth } from "firebase/auth";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import ProfileScreenUnsub from "./ProfileScreenUnsub";
import { emptyItems } from "../../store/reducers/cartSlice";
import {
  switchLightMode,
  switchToDayMode,
} from "../../store/reducers/appColorSlice";

interface IProfileScreen {
  username?: string;
}

const ProfileScreen: FC<IProfileScreen> = ({ username = "default" }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch(); //redux
  const user = auth.currentUser;
  const authInstance = getAuth();

  const { t } = useTranslation(); //localization

  const mode = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#121212" : "#FFFFFF",
    textColor: isNight ? "#FFFFFF" : "#121212",
  };

  //animation to be added here later

  const handlePress = () => {
    dispatch(switchLightMode());
  };

  const LoggedOut = async () => {
    try {
      dispatch(deleteUserData());
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

  if (!user) {
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
            title={t("My Orders")}
            onPress={() => navigation.navigate("MyOrdersScreen")}
          />
          <ProfileSectionButton
            title={t("Language")}
            // onPress={() => navigation.navigate("LanguageScreen")}
            onPress={() => {
              openDeviceLanguageSettings();
            }}
          />

          <ProfileSectionButton
            title={t("Log Out")}
            onPress={() => {
              LoggedOut();
              navigation.navigate("AuthStack");
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
