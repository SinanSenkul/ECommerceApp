import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { s, vs } from 'react-native-size-matters';
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/colors';

interface AppButtonProps {
  onPress?: () => void;
  style?: TextStyle | TextStyle[];
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  titleStyle?: TextStyle | TextStyle[];
  disabled?: boolean
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
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, { backgroundColor: disabled ? AppColors.disabledGray : backgroundColor }, style]}
    >
      <AppText
        style={[styles.title, { color: disabled ? "#000" : textColor }, titleStyle]}
        variant="medium"
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default AppButton

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