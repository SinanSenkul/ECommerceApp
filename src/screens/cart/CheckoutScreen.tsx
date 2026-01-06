import { Alert, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppSafeView from '../../components/views/AppSafeView'
import { AppStyles, sharedStyles } from '../../styles/sharedStyles';
import { AppColors } from '../../styles/colors';
import { s, vs } from 'react-native-size-matters';
import AppTextInput from '../../components/inputs/AppTextInput';
import HomeHeader from '../../components/headers/HomeHeader';
import AppButton from '../../components/buttons/AppButton';
import { isIOS } from '../../constants/constants';
import { useNavigation } from '@react-navigation/native';
import AppTextInputController from '../../components/inputs/AppTextInputController';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup
  .object({
    fullName: yup.string().required("Name is required!"),
    emailAddress: yup.string().email("This is not a valid email!").required("Email is required!").matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      ),
    detailedAddress: yup.string().min(15, "Address too short!").required("Detailed address is required!"),
  }).required();

  type formData = yup.InferType<typeof schema>;

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema)
  });
  const saveOrder =(formData)=>{
    console.log(formData);
  }

  // when text is written it'll be changed in global and if user goes back and again comes to checkout his information will be there
  return (
    <AppSafeView style={{ flex: 1 }}>
      <HomeHeader />
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <AppButton
          title="Back"
          style={styles.backButton}
          onPress={() => navigation.navigate("CartScreen")}
        />
        <View style={styles.inputContainer}>
          <AppTextInputController 
            control={control}
            name={"fullName"}
            placeholder="Full Name"
          />
          <AppTextInputController
            control={control}
            name={"emailAddress"}
            placeholder="Email Address"
          />
          <AppTextInputController
            control={control}
            name={"detailedAddress"}
            placeholder="Address"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton title="Confirm & Pay" onPress={handleSubmit(saveOrder)} />
      </View>
    </AppSafeView>
  );
}

export default CheckoutScreen

const styles = StyleSheet.create({
  inputContainer: {
    ...AppStyles.shadow,
    padding: s(8),
    borderRadius: s(8),
    backgroundColor: AppColors.white,
    marginTop: isIOS ? vs(10) : 0,
    paddingVertical: vs(15)
  },
  buttonContainer: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
    position: "absolute",
    bottom: vs(3),
    width: "100%",
  },
  backButton:{
    width:"25%",
    marginTop:vs(5),
    alignSelf:"flex-start"
  }
});
