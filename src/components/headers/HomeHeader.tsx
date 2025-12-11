import { StyleSheet, Image } from "react-native";
import React from "react";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import { images } from "../../constants/image-paths";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeHeader = () => {
  //
  return (
    <SafeAreaView style={styles.container}>
      <Image source={images.appLogo} style={styles.logo} />
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
