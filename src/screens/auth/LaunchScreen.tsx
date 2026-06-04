import { StyleSheet, ActivityIndicator, View } from "react-native";
import React from "react";
import { AppColors } from "../../styles/colors";

const LaunchScreen = () => {
  return (
    <View style={styles.userLoggedIn}>
      <ActivityIndicator size="large" color={AppColors.white} />
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  userLoggedIn: {
    flex: 1,
    backgroundColor: AppColors.black,
    alignItems: "center",
    justifyContent: "center",
  },
});
