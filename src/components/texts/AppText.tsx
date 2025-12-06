import { StyleSheet, Text, TextProps, TextStyle, View } from 'react-native'
import React, { Children, FC } from 'react'
import { s, vs } from "react-native-size-matters";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: "bold" | "medium";
}

const AppText: FC<AppTextProps> = ({
  children,
  style,
  variant = "medium",
  ...rest
}) => {
  return (
    <View>
      <Text {...rest} style={[styles[variant], style]}>
        {children}
      </Text>
    </View>
  );
};

export default AppText

const styles = StyleSheet.create({
  bold: {
    fontSize: s(18),
    fontWeight: "bold",
    color: "#000",
  },
  medium: {
    fontSize: s(16),
    color: "#000",
  },
});