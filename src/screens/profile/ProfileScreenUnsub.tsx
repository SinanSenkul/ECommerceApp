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
import { deleteUserData } from "../../store/reducers/userSlice";
import { signOut, getAuth } from "firebase/auth";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";

interface IProfileScreen {
  username?: string;
}

const ProfileScreenUnsub: FC<IProfileScreen> = ({ username = "default" }) => {
  const navigation = useNavigation();
  const { t } = useTranslation(); //localization

  return (
    <AppSafeView>
      <HomeHeader />
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <ProfileSectionButton
          title={t("Log In or Sign Up")}
          onPress={() => navigation.navigate("AuthStack")}
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

export default ProfileScreenUnsub;

const styles = StyleSheet.create({});
