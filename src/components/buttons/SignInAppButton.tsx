import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import React, { FC } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppButtonText from "../texts/AppButtonText";

interface SignInAppButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const SignInAppButton: FC<SignInAppButtonProps> = ({
  onPress,
  style,
  title,
  backgroundColor = AppColors.primary,
  textColor,
  titleStyle,
  disabled = false,
}) => {
  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundWhite
      : AppColors.backgroundBlack,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          // backgroundColor: disabled ? AppColors.disabledGray : backgroundColor,
          backgroundColor: lightMode.backgroundColor,
        },
        style,
      ]}
    >
      <AppButtonText style={[styles.title, titleStyle]} variant="medium" textcolor={textColor}>
        {title}
      </AppButtonText>
    </TouchableOpacity>
  );
};

export default SignInAppButton;

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
