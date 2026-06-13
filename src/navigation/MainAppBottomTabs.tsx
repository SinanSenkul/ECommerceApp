import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import CartScreen from "../screens/cart/CartScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { AppColors } from "../styles/colors";
import { s, vs } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import AppSafeView from "../components/views/AppSafeView";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();
const TAB_SWIPE_DISTANCE = s(70);
const TAB_SWIPE_VELOCITY = s(450);

const createSwipeableTabScreen =
  (
    ScreenComponent: React.ComponentType<any>,
    routeOrder: string[],
  ) =>
  (props: any) => {
    const currentIndex = routeOrder.indexOf(props.route.name);

    const handleSwipeEnd = ({ nativeEvent }: any) => {
      if (nativeEvent.state !== State.END || currentIndex < 0) {
        return;
      }

      const { translationX, translationY, velocityX } = nativeEvent;
      const isHorizontalSwipe =
        Math.abs(translationX) > Math.abs(translationY) * 1.25 &&
        (Math.abs(translationX) > TAB_SWIPE_DISTANCE ||
          Math.abs(velocityX) > TAB_SWIPE_VELOCITY);

      if (!isHorizontalSwipe) {
        return;
      }

      const nextIndex = translationX < 0 ? currentIndex + 1 : currentIndex - 1;
      const nextRouteName = routeOrder[nextIndex];

      if (nextRouteName) {
        props.navigation.navigate(nextRouteName);
      }
    };

    return (
      <PanGestureHandler
        activeOffsetX={[-20, 20]}
        failOffsetY={[-30, 30]}
        onHandlerStateChange={handleSwipeEnd}
      >
        <View style={styles.swipeContainer}>
          <ScreenComponent {...props} />
        </View>
      </PanGestureHandler>
    );
  };

const tabRoutes = ["HomeScreen", "CartScreen", "ProfileScreen"];
const SwipeableHomeScreen = createSwipeableTabScreen(HomeScreen, tabRoutes);
const SwipeableCartScreen = createSwipeableTabScreen(CartScreen, tabRoutes);
const SwipeableProfileScreen = createSwipeableTabScreen(ProfileScreen, tabRoutes);

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
            component={SwipeableHomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              title: "Home",
            }}
          />
          <Tab.Screen
            name="CartScreen"
            component={SwipeableCartScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart" size={size} color={color} />
              ),
              title: "Cart",
            }}
          />
          <Tab.Screen
            name="ProfileScreen"
            component={SwipeableProfileScreen}
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
  swipeContainer: {
    flex: 1,
  },
});
