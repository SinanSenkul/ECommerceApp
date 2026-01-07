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


const schema = yup
  .object({
    userName: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!"),
  }).required();

  type formData = yup.InferType<typeof schema>;

const SignInScreen = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

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
      navigation.navigate("MainAppBottomTabs");
      console.log(userCredential);
      setInvalid(false);
    } catch (error) {
      let errorMessage = "";
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Username or password is wrong";
      } else{
        errorMessage = "Something seems wrong";
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
