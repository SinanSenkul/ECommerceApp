import { StyleSheet, Text, Image, Alert, Modal } from "react-native";
import React, { useState } from "react";
import AppSafeView from "../../components/views/AppSafeView";
import { sharedStyles } from "../../styles/sharedStyles";
import { images } from "../../constants/image-paths";
import { s, vs } from "react-native-size-matters";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import { AppColors } from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import AppTextInputController from "../../components/inputs/AppTextInputController";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  getAuth,
  deleteUser,
  signOut,
} from "firebase/auth";
import { showMessage } from "react-native-flash-message";
import { useDispatch } from "react-redux";
import { deleteUserData, setUserData } from "../../store/reducers/userSlice";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const schema = yup
  .object({
    password: yup
      .string()
      .required(t("Password is required!"))
      .min(6, t("Password must be at least 6 characters long")),
  })
  .required();

type formData = yup.InferType<typeof schema>;

const DeleteUserScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation(); //localization tool

  const auth = getAuth();
  const user = auth.currentUser;

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const deactivateUser = async (data: formData) => {
    if (!data.password) {
      Alert.alert(t("Error, please fill in all fields"));
      return;
    }
    try {
      await signOut(auth);
      deleteUser(user)
        .then(() => {
          dispatch(deleteUserData());
          showMessage({
            message: t("Account deleted successfully!"),
            type: "success",
            duration: 1000,
            floating: true,
            icon: "success",
            position: "top",
          });
          // Navigate to login or home screen
          // navigation.navigate("MainAppBottomTabs");
        })
        .catch((error) => {
          let message = t("Deactivation failed");
          showMessage({
            message: message,
            type: "danger",
            duration: 1000,
            floating: true,
            icon: "danger",
            position: "top",
          });
        });
    } catch (e) {
      console.log("deactivation error: ", e);
    }
  };

  return (
    <AppSafeView style={styles.container}>
      <Image source={images.appLogo} style={styles.logo} />
      <AppTextInputController
        control={control}
        name={"password"}
        placeholder={t("Password")}
        secureTextEntry
      />
      <AppText style={styles.appName}>Smart E-Commerce</AppText>
      <AppButton
        title={t("Delete My Account")}
        onPress={handleSubmit(deactivateUser)}
        style={{ backgroundColor: AppColors.red }}
      />
      <AppButton
        title={t("Cancel")}
        onPress={() => navigation.navigate("ProfileScreen")}
        style={styles.signInButton}
        textColor={AppColors.primary}
      />
    </AppSafeView>
  );
};

export default DeleteUserScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  logo: {
    height: vs(150),
    width: s(150),
    marginBottom: vs(30),
  },
  appName: {
    fontSize: s(16),
    marginBottom: vs(15),
  },
  signInButton: {
    backgroundColor: AppColors.white,
    borderWidth: s(1),
    borderColor: AppColors.primary,
    marginTop: vs(15),
  },
});
