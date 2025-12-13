import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { s,vs } from 'react-native-size-matters';
import AppText from '../../components/texts/AppText';
import { AppFonts } from '../../styles/fonts';
import AppButton from '../../components/buttons/AppButton';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from '../../styles/colors';

const EmptyCart = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="shopping-outline"
        size={90}
        style={{ marginBottom: vs(5), opacity: 0.1 }}
        color={AppColors.primary}
      />
      <AppText style={styles.title}>Your Cart is Empty</AppText>
      <AppButton
        title="Start Shopping"
        onPress={() => navigation.navigate("HomeScreen")}
      ></AppButton>
    </View>
  );
}

export default EmptyCart

const styles = StyleSheet.create({
  container: {
    width:"100%",
    height:"100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: s(10),
  },
  title: {
    fontSize: s(20),
    fontFamily: AppFonts.Bold,
    marginBottom: vs(10),
  },
});