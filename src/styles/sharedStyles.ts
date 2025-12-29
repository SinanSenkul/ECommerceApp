import { s } from "react-native-size-matters";
import { StyleSheet } from "react-native";
import { AppColors } from "./colors";

export const sharedStyles = {
  paddingHorizontal: s(12),
};

export const AppStyles = StyleSheet.create({
  shadow: {
    //IOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    //Android
    elevation: 4,
  }
});