import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import FlashMessage from "react-native-flash-message";
import { NavigationContainer } from "@react-navigation/native";
import MainAppStack from "./src/navigation/MainAppStack";
import { useFonts } from "expo-font";
import { persistor, store } from "./src/store/store";
import { Provider } from "react-redux";
import i18n from "./src/localization/i18n";
import { I18nextProvider } from "react-i18next";
import { PersistGate } from "redux-persist/integration/react";
import { getLocales } from "expo-localization";
import { StripeProvider } from "@stripe/stripe-react-native";
import { stripeConfig } from "./src/config/stripe";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/config/firebase";
import { useDispatch } from "react-redux";
import { switchToDayMode } from "./src/store/reducers/dayNightModeSlice";
import {
  subscribeToActiveAppBadgeSync,
  subscribeToSaleNotificationBadgeUpdates,
  syncSaleNotificationBadgeCount,
} from "./src/services/saleNotificationBadgeService";

const LoggedOutDayModeSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        dispatch(switchToDayMode());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
};

const SaleNotificationBadgeSync = () => {
  useEffect(() => {
    syncSaleNotificationBadgeCount();
    const unsubscribeFromBadgeUpdates =
      subscribeToSaleNotificationBadgeUpdates();
    const unsubscribeFromAppState = subscribeToActiveAppBadgeSync();

    return () => {
      unsubscribeFromBadgeUpdates();
      unsubscribeFromAppState();
    };
  }, []);

  return null;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "Nunito-Bold": require("./src/assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Medium": require("./src/assets/fonts/Nunito-Medium.ttf"),
  });

  async function getDeviceLanguage() {
    try {
      const deviceLang = getLocales()[0]?.languageCode ?? "en";
      await i18n.changeLanguage(deviceLang);
    } catch (e) {
      console.error("Error loading device language:", e);
      await i18n.changeLanguage("en"); // Fallback on error
    }
  }

  useEffect(() => {
    getDeviceLanguage();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <LoggedOutDayModeSync />
          <SaleNotificationBadgeSync />
          <I18nextProvider i18n={i18n}>
            <StripeProvider publishableKey={stripeConfig.publishableKey}>
              <NavigationContainer>
                <FlashMessage position={"bottom"} />
                <MainAppStack />
              </NavigationContainer>
            </StripeProvider>
          </I18nextProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flashMessage: {
    alignItems: "center",
    justifyContent: "center",
  },
});
