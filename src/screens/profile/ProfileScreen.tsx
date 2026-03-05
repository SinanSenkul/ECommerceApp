import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUserData } from "../../store/reducers/userSlice";
import { signOut, getAuth } from "firebase/auth";

interface IProfileScreen {
  username?: string;
}

const ProfileScreen: FC<IProfileScreen> = ({ username = "default" }) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state: RootState) => state.userSlice);
  const dispatch = useDispatch(); //redux
  const user = auth.currentUser;
  const authInstance = getAuth();
  const userName = user?.email?.split("@")[0];

  const { t } = useTranslation(); //localization

  const LoggedOut = async () => {
    try {
      dispatch(deleteUserData());
      await signOut(authInstance);
    } catch (e) {
      console.error("logout error: ", e);
    }
  };

  return (
    <AppSafeView>
      <HomeHeader />
      <AppText
        variant="bold"
        style={{ fontSize: s(18), marginTop: vs(10), marginLeft: s(5) }}
      >
        {t("common.messages.profileGreeting", { userName: userName })}
      </AppText>
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <ProfileSectionButton
          title={t("My Orders")}
          onPress={() => navigation.navigate("MyOrdersScreen")}
        />
        <ProfileSectionButton
          title={t("Language")}
          onPress={() => navigation.navigate("LanguageScreen")}
        />

        <ProfileSectionButton
          title={t("Log Out")}
          onPress={() => {
            LoggedOut();
            navigation.navigate("AuthStack");
          }}
        />
      </View>
      <AppButton
        title={t("Back")}
        style={{ marginTop: vs(5) }}
        onPress={() => navigation.goBack()}
      />
    </AppSafeView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
