import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppButtonText from "../texts/AppButtonText";

interface AppButtonProps {
  onPress?: () => void;
  style?: TextStyle | TextStyle[];
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  titleStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
}

const AppButton: FC<AppButtonProps> = ({
  onPress,
  style,
  title,
  backgroundColor = AppColors.primary,
  textColor = "#fff",
  titleStyle,
  disabled = false,
}) => {
  const mode = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#FFFFFF" : "#121212",
  };
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          // backgroundColor: disabled ? AppColors.disabledGray : backgroundColor,
          backgroundColor:lightMode.backgroundColor
        },
        style,
      ]}
    >
      <AppButtonText style={[styles.title, titleStyle]} variant="medium">
        {title}
      </AppButtonText>
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    width: "85%",
    height: vs(40),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: s(25),
    alignSelf: "center",
  },
  title: {
    fontSize: s(16),
  },
});
