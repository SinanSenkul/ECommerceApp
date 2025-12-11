import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "./AuthStack";
import MainAppBottomTabs from "./MainAppBottomTabs";
import { TouchableOpacity, StyleSheet } from "react-native";
import AppSafeView from "../components/views/AppSafeView";

const Stack = createStackNavigator();

export default function MainAppStack(){
    return (
      <AppSafeView style={styles.container}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthStack" component={AuthStack}></Stack.Screen>
          <Stack.Screen
            name="MainAppBottomTabs"
            component={MainAppBottomTabs}
          ></Stack.Screen>
        </Stack.Navigator>
      </AppSafeView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});