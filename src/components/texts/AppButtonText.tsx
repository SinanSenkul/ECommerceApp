import { StyleSheet, Text, TextProps, TextStyle, View } from 'react-native'
import React, { Children, FC } from 'react'
import { s, vs } from "react-native-size-matters";
import { AppColors } from '../../styles/colors';
import { AppFonts } from '../../styles/fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface AppButtonTextProps extends TextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: "bold" | "medium";
}

const AppButtonText: FC<AppButtonTextProps> = ({
  children,
  style,
  variant = "medium",
  ...rest
}) => {
  const mode = useSelector((state: RootState) => state.appColor); // nightmode/daymode
    const isNight = mode === "nightMode";
    const lightMode = {
      textColor: isNight ? "#121212" : "#FFFFFF",
    };
  return (
    <Text {...rest} style={[styles[variant], style, {color:lightMode.textColor}]}>
      {children}
    </Text>
  );
};

export default AppButtonText

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