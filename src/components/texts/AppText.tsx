import { Animated, StyleSheet, TextProps, TextStyle } from 'react-native'
import React, { FC, useEffect, useRef } from 'react'
import { s, vs } from "react-native-size-matters";
import { AppColors } from '../../styles/colors';
import { AppFonts } from '../../styles/fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface AppTextProps extends TextProps {
  children?: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: "bold" | "medium";
}

const AppText: FC<AppTextProps> = ({
  children,
  style,
  variant = "medium",
  ...rest
}) => {
  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const colorTransition = useRef(new Animated.Value(isNight ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorTransition, {
      toValue: isNight ? 1 : 0,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [colorTransition, isNight]);

  const textColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.backgroundBlack, AppColors.white],
  });

  return (
    <Animated.Text {...rest} style={[styles[variant], style, { color: textColor }]}>
      {children}
    </Animated.Text>
  );
};

export default AppText

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
