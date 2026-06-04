import {
  Animated,
  Keyboard,
  Pressable,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import React, { FC, useEffect, useRef } from 'react'
import { isAndroid } from '../../constants/constants';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { AppColors } from '../../styles/colors';

interface AppSafeViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AppSafeView: FC<AppSafeViewProps> = ({ children, style }) => {
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const colorTransition = useRef(new Animated.Value(isNight ? 1 : 0)).current;
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const { backgroundColor: _backgroundColor, ...contentStyle } =
    flattenedStyle;

  useEffect(() => {
    Animated.timing(colorTransition, {
      toValue: isNight ? 1 : 0,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [colorTransition, isNight]);

  const backgroundColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.backgroundWhite, AppColors.backgroundBlack],
  });

  return (
    <Pressable
      onPress={Keyboard.dismiss}
      style={styles.safeArea}
    >
      <Animated.View
        style={[styles.viewMain, contentStyle, { backgroundColor }]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AppSafeView

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: isAndroid ? StatusBar.currentHeight || 0 : 0, //currentHeight is Android specific
  },
  viewMain: {
    flex: 1,
  },
});
