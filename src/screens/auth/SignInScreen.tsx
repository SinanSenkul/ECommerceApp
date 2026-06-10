import { StyleSheet, Image } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
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
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../store/reducers/userSlice";
import { emptyItems } from "../../store/reducers/cartSlice";
import { useTranslation } from "react-i18next";
import { AppFonts } from "../../styles/fonts";
import { LoggedIn } from "../../helpers/loggedIn";
import { RootState } from "../../store/store";
import SignInAppButton from "../../components/buttons/SignInAppButton";
import LaunchScreen from "./LaunchScreen";

const createSchema = (translate: (key: string) => string) =>
  yup
    .object({
      userName: yup.string().required(translate("Username is required!")),
      password: yup.string().required(translate("Password is required!")),
    })
    .required();
type formData = yup.InferType<ReturnType<typeof createSchema>>;

const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.data();
  } catch (error) {
    console.log("user profile could not be fetched: ", error);
    return undefined;
  }
};

const resetToMainApp = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [{ name: "MainAppBottomTabs" }],
  });
};

//screen
const SignInScreen = () => {
  const navigation = useNavigation<any>(); //navigation
  const dispatch = useDispatch(); //redux
  const { t } = useTranslation(); //localization
  const schema = useMemo(() => createSchema(t), [t]);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode 
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.backgroundBlack : AppColors.backgroundWhite,
    textColor: isNight ? AppColors.white : AppColors.black,
    signUpGuestButtonTextColor: isNight ? AppColors.black : AppColors.white,
  };

  //validation
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.uid);
        const userDataObj = {
          uid: currentUser.uid,
          ...(userProfile ?? {}),
        };
        dispatch(setUserData(userDataObj));
        LoggedIn();
        resetToMainApp(navigation);
        return;
      }

      setIsAppLoading(false);
    });

    return unsubscribe;
  }, [dispatch, navigation]);

  const signIn = async (data: formData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.userName,
        data.password,
      );
      const userProfile = await getUserProfile(userCredential.user.uid);
      const userDataObj = {
        uid: userCredential.user.uid,
        ...(userProfile ?? {}),
      };
      dispatch(emptyItems());
      dispatch(setUserData(userDataObj)); // we get the user data from db rather than reducer currently
      LoggedIn(); //local update
      resetToMainApp(navigation);
    } catch (error: any) {
      let errorMessage = t("Sign-in failed");
      if (error.code === "auth/user-not-found") {
        errorMessage = t("User not found");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = t("Username or password is wrong");
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t("Invalid email address");
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = t("Too many requests. Please try again later");
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = t("Network request failed");
      } else {
        console.log("sign-in error: ", error);
      }
      showMessage({
        message: errorMessage,
        type: "danger",
        duration: 1000,
        floating: true,
        icon: "danger",
        position: "top",
      });
    }
  };

  // user will be able to type either his username or email here
  if (isAppLoading) {
    return <LaunchScreen />;
  }

  return (
    <AppSafeView style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}>
      <Image source={images.appLogo} style={styles.logo} />
      <AppTextInputController
        control={control}
        name={"userName"}
        placeholder={t("Email")}
      />
      <AppTextInputController
        control={control}
        name={"password"}
        placeholder={t("Password")}
        secureTextEntry
      />
      <AppText style={styles.appName}>
        {t("Welcome to Smart E-Commerce")}
      </AppText>
      <AppButton title={t("Login")} onPress={handleSubmit(signIn)} textColor={AppColors.white}/>
      <SignInAppButton
        title={t("Sign Up")}
        onPress={() => navigation.navigate("SignUpScreen")}
        style={styles.registerButton}
        textColor={AppColors.black}
      />
      <SignInAppButton
        title={t("Guest Entrance")}
        onPress={() => resetToMainApp(navigation)}
        style={styles.registerButton}
        textColor={AppColors.black}
      />
    </AppSafeView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: "center",
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  logo: {
    height: vs(150),
    width: s(150),
    marginBottom: vs(30),
  },
  appName: {
    fontFamily: AppFonts.Bold,
    fontSize: s(16),
    marginVertical: vs(15),
  },
  registerButton: {
    backgroundColor: AppColors.white,
    borderWidth: s(1),
    borderColor: AppColors.primary,
    marginTop: vs(15),
  },
  userLoggedIn: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
});

// const userCredentialUser = {
//   _redirectEventId: undefined,
//   apiKey: "AIzaSyDizqH8AkQnqBMp9E4TdHyco8_woAJ_XGg",
//   appName: "[DEFAULT]",
//   createdAt: "1767794184599",
//   displayName: undefined,
//   email: "s@g.com",
//   emailVerified: false,
//   isAnonymous: false,
//   lastLoginAt: "1768430240299",
//   phoneNumber: undefined,
//   photoURL: undefined,
//   providerData: [[Object]],
//   stsTokenManager: {
//     accessToken:
//       "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA4MmU5NzVlMDdkZmE0OTYwYzdiN2I0ZmMxZDEwZjkxNmRjMmY1NWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc21hcnQtZS1jb21tZXJjZS1hcHAtMjQ5YTAiLCJhdWQiOiJzbWFydC1lLWNvbW1lcmNlLWFwcC0yNDlhMCIsImF1dGhfdGltZSI6MTc2ODQzMDI3MiwidXNlcl9pZCI6InpYbkFIeVJTNHBTTDJoWEdMNU9LU0hmekY3dzEiLCJzdWIiOiJ6WG5BSHlSUzRwU0wyaFhHTDVPS1NIZnpGN3cxIiwiaWF0IjoxNzY4NDMwMjcyLCJleHAiOjE3Njg0MzM4NzIsImVtYWlsIjoic0BnLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJzQGcuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.oe1XSlTp3gOu9GMfMljq4l9KszyBr_T66290EJ_NMd6e_-uS8WlsP58uGhAz-1FT8RhBvmf6KGqyMgZ7LaBVe_7OYSBK1L0r_p7NYRu_s-AFNAL9FYDIyt6RxCXWsvWPqoYwDGntA0jZhgdtdfEzy0L17AEmxHITmV1pf4mepO3EXuYQylyNaHfoh1RIOT5tS1SdpfBRsVvyDTWHsotxAXJS8QaLOh34AiXG_-2VL9cO9Ri2hecOijrZWtawGYXfeNbrw5sC6feodc0GfHLD5v0mDzSZnxtPYJKXbZTvpxbd4reyoL_jefDY-sb_HnMP-LyS1RqXPyGA3_OMxVdg1g",
//     expirationTime: 1768433873001,
//     refreshToken:
//       "AMf-vBwJduM6CcU6bP6zrVeMSSszpzg7eDVPi4tLMukB6kI18yorgf406Iubt8xx1_aLmihN0hdvMfufGGYGgbF20T9OGFumgI_srOuwwIwfbMkgakn3RAk-akUrmXD7-0YOIO4JWmljBIqAq1cqwBvsaw032QcG9RgZAmPdHcUU8S0mkKs56K6WMsDJc_X6lqLC7ILv6jqvTXJRc40CWJ2ZKp6qxPMKne3I4XjUjCFivBaXr2G70lc",
//   },
//   tenantId: undefined,
//   uid: "zXnAHyRS4pSL2hXGL5OKSHfzF7w1",
// };
