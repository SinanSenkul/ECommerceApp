import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "./AuthStack";
import MainAppBottomTabs from "./MainAppBottomTabs";
import { TouchableOpacity, StyleSheet } from "react-native";
import AppSafeView from "../components/views/AppSafeView";
import CheckoutScreen from "../screens/cart/CheckoutScreen";
import CartScreen from "../screens/cart/CartScreen";
import HomeScreen from "../screens/home/HomeScreen";
import MyOrdersScreen from "../screens/profile/MyOrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LanguagesScreen from "../screens/language/LanguagesScreen";
import { useTranslation } from "react-i18next";

const Stack = createStackNavigator();

export default function MainAppStack() {
  const { t } = useTranslation();
  return (
    <AppSafeView style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainAppBottomTabs" component={MainAppBottomTabs} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguagesScreen} />
        <Stack.Screen
          name="MyOrdersScreen"
          component={MyOrdersScreen}
          options={{ headerShown: true, headerBackTitle: t("Back"), title: t("My Orders") }}
        />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </AppSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
