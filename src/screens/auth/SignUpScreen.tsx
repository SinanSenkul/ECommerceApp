import { StyleSheet, Text, Image, Alert } from "react-native";
import React, { useState } from "react";
import AppSafeView from "../../components/views/AppSafeView";
import { sharedStyles } from "../../styles/sharedStyles";
import { images } from "../../constants/image-paths";
import { s,vs } from "react-native-size-matters";
import AppTextInput from "../../components/inputs/AppTextInput";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import { AppColors } from "../../styles/colors";
import { useNavigation } from "@react-navigation/native";
import AppTextInputController from '../../components/inputs/AppTextInputController';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "../../config/firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { showMessage } from "react-native-flash-message";

const schema = yup
  .object({
    emailAddress: yup.string().email("This is not a valid email!").required("Email is required!").matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid email format"
          ),
    password: yup.string().required("Password is required!").min(6, 'Password must be at least 6 characters long'),
  }).required();

  type formData = yup.InferType<typeof schema>;

const SignUpScreen = () => {

  const { control, handleSubmit } = useForm({
        resolver: yupResolver(schema)
      });
  
  const signUp = async (data: formData) => {
    if (!data.emailAddress || !data.password ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
 try {
      const auth = getAuth();
      const userCredential =  createUserWithEmailAndPassword(auth, data.emailAddress.trim(), data.password);
      showMessage({
              message: 'Account created successfully!',
              type: "success",
              duration: 1000,
              floating: true,
              icon: "success",
              position: "top",
            });
      // Navigate to login or home screen
      navigation.navigate('MainAppBottomTabs');
      return (await userCredential).user;
    } catch (error) {
      let message = "Sign-up failed";
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak (min 6 characters)";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
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

const navigation = useNavigation();

  return (
    <AppSafeView style={styles.container}>
      <Image source={images.appLogo} style={styles.logo} />
      <AppTextInputController
        control={control}
        name={"emailAddress"}
        placeholder="Email"
      />
      <AppTextInputController
        control={control}
        name={"password"}
        placeholder="Password"
        secureTextEntry
      />
      <AppText style={styles.appName}>Smart E-Commerce</AppText>
      <AppButton 
        title="Create New Account" 
        onPress={handleSubmit(signUp)} 
      />
      <AppButton
        title="Go to Sign In"
        onPress={() => navigation.navigate("SignInScreen")}
        style={styles.signInButton}
        textColor={AppColors.primary}
      />
    </AppSafeView>
  );
};

export default SignUpScreen;

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
    borderWidth:s(1),
    borderColor:AppColors.primary,
    marginTop: vs(15),
  },
});
