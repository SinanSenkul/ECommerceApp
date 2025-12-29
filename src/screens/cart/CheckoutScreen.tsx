import { StyleSheet, Text, View } from 'react-native'
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

const CheckoutScreen = () => {
  const navigation = useNavigation();
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
          <AppTextInput placeholder="Full Name" />
          <AppTextInput placeholder="Email Address" />
          <AppTextInput placeholder="Address" />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton title="Confirm & Pay" />
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