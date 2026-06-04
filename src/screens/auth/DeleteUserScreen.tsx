import { StyleSheet, Image, Alert, Modal, View } from "react-native";
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
// import { auth } from "../../config/firebase";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { deleteUserData } from "../../store/reducers/userSlice";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { RootState } from "../../store/store";

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
  const [modalVisible, setModalVisible] = useState(false);
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
          let message = t("Deletion failed");
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
              Are you sure?
            </AppText>

            <AppText
              style={{
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              This will permanently delete your account and all associated data.
              {"\n"}
              This action cannot be undone.
            </AppText>

            {/* Confirm button triggers the actual deletion with password validation */}
            <AppButton
              title={t("Yes, Delete My Account")}
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
          title={t("Delete My Account")}
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
