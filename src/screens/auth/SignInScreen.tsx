import { StyleSheet, Text, Image, Alert, View } from "react-native";
import React, { useState } from "react";
import AppSafeView from "../../components/views/AppSafeView";
import { sharedStyles } from "../../styles/sharedStyles";
import { images } from "../../constants/image-paths";
import { s,vs } from "react-native-size-matters";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import { AppColors } from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import AppTextInputController from '../../components/inputs/AppTextInputController';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setUserData } from "../../store/reducers/userSlice";
import { emptyItems } from "../../store/reducers/cartSlice";


const schema = yup
  .object({
    userName: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!"),
  }).required();

  type formData = yup.InferType<typeof schema>;

const SignInScreen = () => {

  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { userData } = useSelector((state: RootState) => state.userSlice);
  const {items} = useSelector((state: RootState) => state.cartSlice);
  const dispatch = useDispatch();

  const { control, handleSubmit } = useForm({
      resolver: yupResolver(schema)
    });

    const signIn = async (data: formData)=>{
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.userName,
          data.password
        );
        
        const userDataObj ={
          uid: userCredential.user.uid,
        }
        
        dispatch(emptyItems());
        dispatch(setUserData(userDataObj)); // we get the user data from db rather than reducer currently

        navigation.navigate("MainAppBottomTabs");

      } catch (error) {
        let errorMessage = "";
        if (error.code === "auth/user-not-found") {
          errorMessage = "User not found";
        } else if (error.code === "auth/invalid-credential") {
          errorMessage = "Username or password is wrong";
        } else {
          errorMessage = `Error: ${error}`;
          console.log("error code: ", error);
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
    }

// user will be able to type either his username or email here
  return (
    <AppSafeView style={styles.container}>
      <Image source={images.appLogo} style={styles.logo} />
      <AppTextInputController
        control={control}
        name={"userName"}
        placeholder="Username or Email"
      />
      <AppTextInputController
        control={control}
        name={"password"}
        placeholder="Password"
        secureTextEntry
      />
      <AppText style={styles.appName}>Smart E-Commerce</AppText>
      <AppButton title="Login" onPress={handleSubmit(signIn)} />
      <AppButton
        title="Sign Up"
        onPress={() => navigation.navigate("SignUpScreen")}
        style={styles.registerButton}
        textColor={AppColors.primary}
      />
    </AppSafeView>
  );
};

export default SignInScreen;

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
  registerButton: {
    backgroundColor: AppColors.white,
    borderWidth:s(1),
    borderColor:AppColors.primary,
    marginTop: vs(15),
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