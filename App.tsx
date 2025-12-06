import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppText from './src/components/texts/AppText';
import AppSafeView from './src/components/views/AppSafeView';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import AppButton from './src/components/buttons/AppButton';

export default function App() {
  return (
    <>
      <FlashMessage position={"bottom"} />
      <AppSafeView style={styles.container}>
        <AppText variant="bold">E-Commerce App</AppText>
        <AppText
          variant="medium"
          onPress={() =>
            showMessage({
              message: "Hello!",
              style: styles.flashMessage,
              duration: 1500,
            })
          }
        >
          click me!
        </AppText>
        <AppButton
          onPress={() =>
            showMessage({
              message: "button pressed!",
              style: styles.flashMessage,
              duration: 1500,
            })
          }
          title={"button"}
          disabled={false}
        />
      </AppSafeView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  flashMessage: {
    alignItems: "center",
    justifyContent: "center",
  },
});