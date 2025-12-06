import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import React, { FC } from 'react'
import { isAndroid } from '../../constants/constants';

interface AppSafeViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AppSafeView: FC<AppSafeViewProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.viewMain, style]}>{children}</View>
    </SafeAreaView>
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
    flex: 1,
  },
});