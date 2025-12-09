import { KeyboardTypeOptions, StyleSheet, TextInput, TextStyle } from 'react-native'
import React, { FC } from 'react'
import { AppColors } from '../../styles/colors';
import { s, vs } from 'react-native-size-matters';

interface AppTextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  style?: TextStyle;
}

const AppTextInput: FC<AppTextInputProps> = ({ value, onChangeText, placeholder, secureTextEntry, keyboardType,style }) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      style={[styles.input, style]}
    />
  );
};

export default AppTextInput

const styles = StyleSheet.create({
  input: {
    height: vs(40),
    width: "85%",
    borderRadius: s(25),
    borderColor: AppColors.borderColor,
    borderWidth: s(1),
    paddingHorizontal: s(15),
    fontSize: s(16),
    backgroundColor: AppColors.white,
    marginBottom: vs(10),
  },
});