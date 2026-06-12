import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import { useSelector } from "react-redux";
import { s, vs } from "react-native-size-matters";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import AppTextInputController from "../../components/inputs/AppTextInputController";
import { auth, db } from "../../config/firebase";
import { RootState } from "../../store/store";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { sharedStyles } from "../../styles/sharedStyles";
import { useTranslation } from "react-i18next";
import { requireVerifiedUser } from "../../helpers/authGuards";

const createSchema = (translate: (key: string) => string) =>
  yup
    .object({
      firstName: yup.string().required(translate("Name is required!")),
      lastName: yup.string().required(translate("Last name is required!")),
      address: yup
        .string()
        .min(15, translate("Address must be at least 15 characters long"))
        .required(translate("Detailed address is required!")),
      currentPassword: yup
        .string()
        .transform((value) => value || "")
        .defined()
        .test(
          "required-for-password-change",
          translate("Current password is required"),
          function (value) {
            const parent = this.parent as { newPassword?: string };
            return !parent.newPassword?.trim() || Boolean(value?.trim());
          },
        ),
      newPassword: yup
        .string()
        .transform((value) => value || "")
        .defined()
        .test(
          "empty-or-min",
          translate("Password must be at least 6 characters long"),
          (value) => !value || value.length >= 6,
        ),
    })
    .required();

interface FormData {
  firstName: string;
  lastName: string;
  address: string;
  currentPassword: string;
  newPassword: string;
}

interface UserProfile {
  uid?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  email?: string;
}

const ProfileInfo = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);
  const [isSaving, setIsSaving] = useState(false);
  const user = auth.currentUser;
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.blueGray,
  };

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      const uid = user?.uid;
      if (!uid) {
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const profile = userDoc.data() as UserProfile | undefined;
        reset({
          firstName: profile?.firstName ?? "",
          lastName: profile?.lastName ?? "",
          address: profile?.address ?? "",
          currentPassword: "",
          newPassword: "",
        });
      } catch (error) {
        console.error("profile info could not be fetched: ", error);
      }
    };

    loadProfile();
  }, [reset, user?.uid]);

  const saveProfile = async (data: FormData) => {
    const verifiedUser = await requireVerifiedUser(t);
    if (!verifiedUser) {
      return;
    }

    if (!user) {
      showMessage({
        message: t("User not found"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
      });
      return;
    }

    try {
      setIsSaving(true);
      const profileData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        address: data.address.trim(),
        email: verifiedUser.email ?? "",
      };

      await updateDoc(doc(db, "users", verifiedUser.uid), profileData);

      if (data.newPassword?.trim()) {
        if (!verifiedUser.email) {
          throw new Error("Missing user email");
        }

        const credential = EmailAuthProvider.credential(
          verifiedUser.email,
          data.currentPassword ?? "",
        );
        await reauthenticateWithCredential(verifiedUser, credential);
        await updatePassword(verifiedUser, data.newPassword.trim());
      }

      reset({
        ...profileData,
        currentPassword: "",
        newPassword: "",
      });

      showMessage({
        message: t("Profile updated successfully"),
        type: "success",
        duration: 1200,
        floating: true,
        icon: "success",
      });
    } catch (error: any) {
      console.error("profile update failed: ", error);
      let message = t("Profile update failed");
      if (
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
      ) {
        message = t("Current password is incorrect");
      } else if (error?.code === "auth/weak-password") {
        message = t("Password is too weak (min 6 characters)");
      } else if (error?.code === "auth/requires-recent-login") {
        message = t("Please log in again to change your password");
      } else if (error?.code === "auth/network-request-failed") {
        message = t("Network request failed");
      }

      showMessage({
        message,
        type: "danger",
        duration: 1600,
        floating: true,
        icon: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader showBackButton />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={[
            styles.formContainer,
            {
              backgroundColor: lightMode.surfaceColor,
              borderColor: lightMode.borderColor,
            },
          ]}
        >
          <AppText style={styles.title}>{t("Profile Information")}</AppText>
          <AppTextInputController
            control={control}
            name="firstName"
            placeholder={t("Name")}
          />
          <AppTextInputController
            control={control}
            name="lastName"
            placeholder={t("Last Name")}
          />
          <AppTextInputController
            control={control}
            name="address"
            placeholder={t("Address")}
          />

          <AppText style={styles.sectionTitle}>{t("Change Password")}</AppText>
          <AppTextInputController
            control={control}
            name="currentPassword"
            placeholder={t("Current Password")}
            secureTextEntry
          />
          <AppTextInputController
            control={control}
            name="newPassword"
            placeholder={t("New Password")}
            secureTextEntry
          />

          {isSaving ? (
            <ActivityIndicator
              size="large"
              color={isNight ? AppColors.white : AppColors.black}
              style={styles.loading}
            />
          ) : (
            <AppButton
              title={t("Save Changes")}
              onPress={handleSubmit(saveProfile)}
              style={styles.saveButton}
            />
          )}

          <AppButton
            title={t("Back")}
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                backgroundColor: lightMode.surfaceColor,
                borderColor: lightMode.borderColor,
              },
            ]}
            textColor={isNight ? AppColors.white : AppColors.black}
          />
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
    paddingVertical: vs(16),
  },
  formContainer: {
    borderWidth: s(1),
    borderRadius: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(16),
    alignItems: "center",
  },
  title: {
    fontFamily: AppFonts.Bold,
    fontSize: s(18),
    marginBottom: vs(14),
    textAlign: "center",
  },
  sectionTitle: {
    width: "85%",
    fontFamily: AppFonts.Bold,
    fontSize: s(15),
    marginTop: vs(8),
    marginBottom: vs(10),
  },
  saveButton: {
    marginTop: vs(8),
  },
  backButton: {
    borderWidth: s(1),
    marginTop: vs(12),
  },
  loading: {
    marginVertical: vs(12),
  },
});
