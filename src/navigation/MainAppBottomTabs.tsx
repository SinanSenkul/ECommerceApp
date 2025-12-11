import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import CartScreen from "../screens/cart/CartScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { AppColors } from "../styles/colors";
import { s, vs } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import AppSafeView from "../components/views/AppSafeView";

const Tab = createBottomTabNavigator();

export default function MainAppBottomTabs(){
    return (
      <AppSafeView style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: {
              justifyContent: "center", // centers the icon vertically
              alignItems: "center",
            },
            tabBarStyle: {
              height: vs(50),
            },
            headerShown: false,
            tabBarActiveTintColor: AppColors.primary,
          }}
        >
          <Tab.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              title: "Home",
            }}
          />
          <Tab.Screen
            name="CartScreen"
            component={CartScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart" size={size} color={color} />
              ),
              title: "Cart",
            }}
          />
          <Tab.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
              title: "Profile",
            }}
          />
        </Tab.Navigator>
      </AppSafeView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});