import { StyleSheet, Text, Image } from "react-native";
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

    const signIn =(formData)=>{
    console.log(formData);
    navigation.navigate("MainAppBottomTabs")
  }

// user will be able to type either his username or email here
  return (
    <AppSafeView style={styles.container}>
      <Image source={images.appLogo} style={styles.logo} />
      {/* <AppTextInput placeholder="Username or Email" onChangeText={setEmail} /> */}
      <AppTextInputController
        control={control}
        name={"userName"}
        placeholder="Username or Email"
      />
      {/* <AppTextInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      /> */}
      <AppTextInputController
        control={control}
        name={"password"}
        placeholder="Password"
        secureTextEntry
      />
      <AppText style={styles.appName}>Smart E-Commerce</AppText>
      <AppButton
        title="Login"
        onPress={handleSubmit(signIn)}
      />
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
