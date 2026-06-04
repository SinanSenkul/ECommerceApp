import { Animated, StyleProp, StyleSheet, TextProps, TextStyle } from "react-native";
import React, { FC } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface AppButtonTextProps extends TextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: "bold" | "medium";
  textcolor?: string | Animated.AnimatedInterpolation<string>;
}

const AppButtonText: FC<AppButtonTextProps> = ({
  children,
  style,
  variant = "medium",
  textcolor,
  ...rest
}) => {
  // const mode = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  // const isNight = mode === "nightMode";
  // const lightMode = {
  //   textColor: isNight ? AppColors.black : AppColors.white,
  // };
  return (
    <Animated.Text
      {...rest}
      style={[styles[variant], style, { color: textcolor }]}
    >
      {children}
    </Animated.Text>
  );
};

export default AppButtonText;

const styles = StyleSheet.create({
  bold: {
    fontSize: s(18),
    fontWeight: "bold",
    color: AppColors.primary,
    fontFamily: AppFonts.Bold,
  },
  medium: {
    fontSize: s(16),
    color: AppColors.primary,
    fontFamily: AppFonts.Medium,
  },
});
