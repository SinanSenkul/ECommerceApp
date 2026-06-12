import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "./AuthStack";
import MainAppBottomTabs from "./MainAppBottomTabs";
import { StyleSheet } from "react-native";
import AppSafeView from "../components/views/AppSafeView";
import CheckoutScreen from "../screens/cart/CheckoutScreen";
import CartScreen from "../screens/cart/CartScreen";
import HomeScreen from "../screens/home/HomeScreen";
import MyOrdersScreen from "../screens/orders/MyOrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ProfileInfo from "../screens/profile/ProfileInfo";
import OrderApprovalScreen from "../screens/orders/OrderApprovalScreen";
import { useTranslation } from "react-i18next";
import DeleteUserScreen from "../screens/auth/DeleteUserScreen";
import SellItemScreen from "../screens/onSale/SellItemScreen";
import ItemsOnSaleScreen from "../screens/onSale/ItemsOnSaleScreen";
import ProductDetail from "../screens/home/ProductDetail";

const Stack = createStackNavigator();

export default function MainAppStack() {
  const { t } = useTranslation();
  return (
    <AppSafeView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="AuthStack"
      >
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen
          name="MainAppBottomTabs"
          component={MainAppBottomTabs}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="DeleteUserScreen" component={DeleteUserScreen} />
        <Stack.Screen name="SellItemScreen" component={SellItemScreen} />
        <Stack.Screen name="ItemsOnSaleScreen" component={ItemsOnSaleScreen} />
        <Stack.Screen
          name="MyOrdersScreen"
          component={MyOrdersScreen}
          // options={{
          //   headerShown: true,
          //   headerBackTitle: t("Back"),
          //   title: t("My Orders"),
          // }}
        />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ProfileInfoScreen" component={ProfileInfo} />
        <Stack.Screen
          name="OrderApprovalScreen"
          component={OrderApprovalScreen}
        />
      </Stack.Navigator>
    </AppSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
