import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import FlashMessage from "react-native-flash-message";
import { NavigationContainer } from "@react-navigation/native";
import MainAppStack from "./src/navigation/MainAppStack";
import { useFonts } from "expo-font";
import { persistor, store } from "./src/store/store";
import { Provider } from "react-redux";
import i18n from "./src/localization/i18n";
import { I18nextProvider } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Nunito-Bold": require("./src/assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Medium": require("./src/assets/fonts/Nunito-Medium.ttf"),
  });

  async function loadAndSetLanguage() {
    try {
      const storedLang = await AsyncStorage.getItem("lang-code");
      if (storedLang) {
        await i18n.changeLanguage(storedLang);
      } else {
        console.log("No stored language, using default");
        await i18n.changeLanguage("en"); // Or your default
      }
    } catch (error) {
      console.error("Error loading language:", error);
      await i18n.changeLanguage("en"); // Fallback on error
    }
  }

  useEffect(() => {
    loadAndSetLanguage();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <NavigationContainer>
              <FlashMessage position={"bottom"} />
              <MainAppStack />
            </NavigationContainer>
          </I18nextProvider>
        </PersistGate>
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
