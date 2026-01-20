import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import AppTextInput from "./AppTextInput";
import { AppColors } from "../../styles/colors";
import AppText from "../texts/AppText";
import { s, vs } from "react-native-size-matters";
import { auth } from "../../config/firebase";

interface IAppTextInputController<T extends FieldValues> {
  control: Control<T>; //T is used to make it generic it can work with with different data types
  name: Path<T>;
  rules?: object;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  value?: string | any;
}

const AppTextInputController = <T extends FieldValues>({
  control,
  name,
  rules,
  placeholder,
  secureTextEntry,
  keyboardType,
  value
}: IAppTextInputController<T>) => {

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={value}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <AppTextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            style={error && styles.errorInput}
          />
          {error && <AppText style={styles.textError}>{error.message}</AppText>}
        </>
      )}
    />
  );
};

export default AppTextInputController;

const styles = StyleSheet.create({
  errorInput: {
    borderColor: AppColors.red,
  },
  textError: {
    color: AppColors.red,
    fontSize: s(12),
    textAlign: "left",
    marginTop: vs(-5),
    marginBottom: vs(10),
  },
});
