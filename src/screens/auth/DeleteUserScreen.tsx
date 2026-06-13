import { StyleSheet, Image, Alert, Modal, View } from "react-native";
import React, { useMemo, useState } from "react";
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
// import { auth } from "../../config/firebase";
import {
  deleteUser,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from "firebase/auth";
import { showMessage } from "react-native-flash-message";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "../../store/store";
import { deleteUserPublicData } from "../../config/dataServices";

const createSchema = (translate: (key: string) => string) =>
  yup
    .object({
      password: yup
        .string()
        .required(translate("Password is required!"))
        .min(6, translate("Password must be at least 6 characters long")),
    })
    .required();

type formData = yup.InferType<ReturnType<typeof createSchema>>;

const DeleteUserScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(); //localization tool
  const schema = useMemo(() => createSchema(t), [t]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    logoTintColor: isNight ? AppColors.white : AppColors.black,
    cancelButtonBackground: isNight ? AppColors.inkBlack : AppColors.white,
    cancelButtonText: isNight ? AppColors.white : AppColors.primary,
    borderColor: isNight ? AppColors.white : AppColors.primary,
  };

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const handleDeletePress = () => {
    setModalVisible(true);
  };

  const deactivateUser = async (data: formData) => {
    if (!data.password) {
      Alert.alert(t("Error, please fill in all fields"));
      return;
    }
    if (!user) {
      showMessage({
        message: t("Deletion failed"),
        type: "danger",
        duration: 1000,
        floating: true,
        icon: "danger",
        position: "top",
      });
      return;
    }
    try {
      if (!user.email) {
        showMessage({
          message: t("Deletion failed"),
          type: "danger",
          duration: 1400,
          floating: true,
          icon: "danger",
          position: "top",
        });
        return;
      }

      setIsDeleting(true);
      const credential = EmailAuthProvider.credential(user.email, data.password);
      await reauthenticateWithCredential(user, credential);
      await deleteUserPublicData(user.uid);
      await deleteUser(user);
      showMessage({
        message: t("Account deleted successfully!"),
        type: "success",
        duration: 1000,
        floating: true,
        icon: "success",
        position: "top",
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "MainAppBottomTabs" }],
      });
    } catch (error: any) {
      console.log("deactivation error: ", error);
      const message =
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
          ? t("Current password is incorrect")
          : error?.code === "auth/requires-recent-login"
            ? t("Please log in again to change your password")
            : t("Deletion failed");

      showMessage({
        message,
        type: "danger",
        duration: 1800,
        floating: true,
        icon: "danger",
        position: "top",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <View
            style={{
              backgroundColor: lightMode.surfaceColor,
              padding: 24,
              borderRadius: 12,
              width: "85%",
              alignItems: "center",
            }}
          >
            <AppText
              style={{
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {t("Are you sure?")}
            </AppText>

            <AppText
              style={{
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {t("This will permanently delete your account and all associated data.")}
              {"\n"}
              {t("This action cannot be undone.")}
            </AppText>

            {/* Confirm button triggers the actual deletion with password validation */}
            <AppButton
              title={isDeleting ? t("Deleting") : t("Yes, Delete My Account")}
              disabled={isDeleting}
              onPress={() => {
                setModalVisible(false);
                // This calls your existing form submission (password validation + deactivateUser)
                handleSubmit(deactivateUser)();
              }}
              style={{
                backgroundColor: AppColors.red,
                width: "100%",
                marginBottom: 12,
              }}
            />

            <AppButton
              title={t("Cancel")}
              onPress={() => setModalVisible(false)}
              style={[
                styles.signInButton,
                {
                  backgroundColor: lightMode.cancelButtonBackground,
                  borderColor: lightMode.borderColor,
                },
              ]}
              textColor={lightMode.cancelButtonText}
            />
          </View>
        </View>
      </Modal>
      <AppSafeView
        style={[
          styles.container,
          { backgroundColor: lightMode.backgroundColor },
        ]}
      >
        <Image
          source={images.appLogo}
          style={[styles.logo, { tintColor: lightMode.logoTintColor }]}
        />
        <AppTextInputController
          control={control}
          name={"password"}
          placeholder={t("Password")}
          secureTextEntry
        />
        <AppText style={styles.appName}>Smart E-Commerce</AppText>
        <AppButton
          title={isDeleting ? t("Deleting") : t("Delete My Account")}
          disabled={isDeleting}
          onPress={handleSubmit(handleDeletePress)}
          style={{ backgroundColor: AppColors.red }}
        />
        <AppButton
          title={t("Cancel")}
          onPress={() => navigation.goBack()}
          style={[
            styles.signInButton,
            {
              backgroundColor: lightMode.cancelButtonBackground,
              borderColor: lightMode.borderColor,
            },
          ]}
          textColor={lightMode.cancelButtonText}
        />
      </AppSafeView>
    </>
  );
};

export default DeleteUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
