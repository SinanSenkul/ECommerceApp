import { Keyboard, Pressable, StatusBar, StyleSheet, View, ViewStyle } from 'react-native'
import React, { FC } from 'react'
import { isAndroid } from '../../constants/constants';
import { SafeAreaView } from "react-native-safe-area-context";

interface AppSafeViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AppSafeView: FC<AppSafeViewProps> = ({ children, style }) => {
  return (
    <Pressable onPress={Keyboard.dismiss}  style={styles.safeArea}>
      <View style={[styles.viewMain, style]}>{children}</View>
    </Pressable>
  );
};

export default AppSafeView

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: isAndroid ? StatusBar.currentHeight || 0 : 0, //currentHeight is Android specific
  },
  viewMain: {
    
  },
});