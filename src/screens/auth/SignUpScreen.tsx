import { StyleSheet, Image, Alert, ScrollView } from "react-native";
import React, { useMemo } from "react";
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
  sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import { useTranslation } from "react-i18next";
import { db } from "../../config/firebase";
import {
  logCrashlyticsBreadcrumb,
  recordCrashlyticsError,
  setCrashlyticsUser,
} from "../../services/crashlyticsService";

const createSchema = (translate: (key: string) => string) =>
  yup
    .object({
      firstName: yup.string().required(translate("Name is required!")),
      lastName: yup.string().required(translate("Last name is required!")),
      address: yup
        .string()
        .min(15, translate("Address must be at least 15 characters long"))
        .required(translate("Detailed address is required!")),
      emailAddress: yup
        .string()
        .email(translate("This is not a valid email!"))
        .required(translate("Email is required!"))
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          translate("Invalid email format"),
        ),
      password: yup
        .string()
        .required(translate("Password is required!"))
        .min(6, translate("Password must be at least 6 characters long")),
    })
    .required();

type formData = yup.InferType<ReturnType<typeof createSchema>>;

const resetToMainApp = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [{ name: "MainAppBottomTabs" }],
  });
};

const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(); //localization tool
  const schema = useMemo(() => createSchema(t), [t]);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const signUp = async (data: formData) => {
    if (
      !data.firstName ||
      !data.lastName ||
      !data.address ||
      !data.emailAddress ||
      !data.password
    ) {
      Alert.alert(t("Error, please fill in all fields"));
      return;
    }
    try {
      //const auth = getAuth();
      logCrashlyticsBreadcrumb("auth_sign_up_started");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.emailAddress.trim(),
        data.password,
      );
      await setCrashlyticsUser(userCredential.user.uid);
      await sendEmailVerification(userCredential.user);
      const userProfile = {
        uid: userCredential.user.uid,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        address: data.address.trim(),
        email: data.emailAddress.trim(),
        emailVerified: userCredential.user.emailVerified,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
      showMessage({
        message: t(
          "Account created successfully! Please verify your email before buying or selling.",
        ),
        type: "success",
        duration: 2500,
        floating: true,
        icon: "success",
        position: "top",
      });
      logCrashlyticsBreadcrumb("auth_sign_up_succeeded");
      // Navigate to login or home screen
      resetToMainApp(navigation);
    } catch (error: any) {
      let message = t("Sign-up failed");
      let shouldRecordError = false;
      if (error.code === "auth/email-already-in-use") {
        message = t("Email is already in use");
      } else if (error.code === "auth/weak-password") {
        message = t("Password is too weak (min 6 characters)");
      } else if (error.code === "auth/invalid-email") {
        message = t("Invalid email address");
      } else if (error.code === "auth/network-request-failed") {
        message = t("Network request failed");
      } else {
        shouldRecordError = true;
      }

      logCrashlyticsBreadcrumb("auth_sign_up_failed", {
        auth_error_code: error.code ?? "unknown",
      });

      if (shouldRecordError) {
        recordCrashlyticsError(error, "auth_sign_up_failed", {
          auth_error_code: error.code ?? "unknown",
        });
      }
      showMessage({
        message: message,
        type: "danger",
        duration: 1000,
        floating: true,
        icon: "danger",
        position: "top",
      });
    }
    // navigation.navigate("MainAppBottomTabs");
  };

  return (
    <AppSafeView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <Image source={images.appLogo} style={styles.logo} />
        <AppTextInputController
          control={control}
          name={"firstName"}
          placeholder={t("Name")}
        />
        <AppTextInputController
          control={control}
          name={"lastName"}
          placeholder={t("Last Name")}
        />
        <AppTextInputController
          control={control}
          name={"address"}
          placeholder={t("Address")}
        />
        <AppTextInputController
          control={control}
          name={"emailAddress"}
          placeholder={t("Email")}
        />
        <AppTextInputController
          control={control}
          name={"password"}
          placeholder={t("Password")}
          secureTextEntry
        />
        <AppText style={styles.appName}>Smart E-Commerce</AppText>
        <AppButton
          title={t("Create New Account")}
          onPress={handleSubmit(signUp)}
        />
        <AppButton
          title={t("Go to Sign In")}
          onPress={() => navigation.navigate("SignInScreen")}
          style={styles.signInButton}
          textColor={AppColors.primary}
        />
      </ScrollView>
    </AppSafeView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: vs(24),
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
