import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from "react-native";
import React, { FC, useEffect, useRef } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppButtonText from "../texts/AppButtonText";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface AppButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const AppButton: FC<AppButtonProps> = ({
  onPress,
  style,
  title,
  backgroundColor,
  textColor,
  titleStyle,
  disabled = false,
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

  const animatedBackgroundColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.backgroundBlack, AppColors.backgroundWhite],
  });
  const animatedTextColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.white, AppColors.black],
  });

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? AppColors.disabledGray
            : backgroundColor ?? animatedBackgroundColor,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <AppButtonText
        style={[styles.title, titleStyle]}
        variant="medium"
        textcolor={textColor ?? animatedTextColor}
      >
        {title}
      </AppButtonText>
    </AnimatedTouchableOpacity>
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
