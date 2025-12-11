import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import AppSafeView from "../components/views/AppSafeView";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <AppSafeView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      </Stack.Navigator>
    </AppSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});