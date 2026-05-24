import { StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import { images } from "../../constants/image-paths";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const HomeHeader = () => {
  const navigation = useNavigation();

   const mode = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#FFFFFF" : "#121212",
    tintColor: isNight ? "#121212" : "#FFFFFF",
  };

  return (
    <SafeAreaView style={[styles.container,{backgroundColor:lightMode.backgroundColor}]}>
      <TouchableOpacity onPress={() => navigation.navigate("MainAppBottomTabs")}>
        <Image source={images.appLogo} style={[styles.logo, {tintColor:lightMode.tintColor}]} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: vs(10),
  },
  logo: {
    height: vs(40),
    width: s(40),
    tintColor: AppColors.white,
  },
});
