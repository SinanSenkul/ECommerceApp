import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import FlashMessage from "react-native-flash-message";
import { NavigationContainer } from "@react-navigation/native";
import MainAppStack from "./src/navigation/MainAppStack";
import { useFonts } from "expo-font";
import { store } from "./src/store/store";
import { Provider } from "react-redux";
import i18n from "./src/localization/i18n";
import { I18nextProvider } from "react-i18next";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Nunito-Bold": require("./src/assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Medium": require("./src/assets/fonts/Nunito-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <NavigationContainer>
            <FlashMessage position={"bottom"} />
            <MainAppStack />
          </NavigationContainer>
        </I18nextProvider>
      </Provider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flashMessage: {
    alignItems: "center",
    justifyContent: "center",
  },
});
