import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useRef } from "react";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import { images } from "../../constants/image-paths";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const HomeHeader = () => {
  const navigation = useNavigation();

   const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const colorTransition = useRef(new Animated.Value(isNight ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorTransition, {
      toValue: isNight ? 1 : 0,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [colorTransition, isNight]);

  const backgroundColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.backgroundBlack, AppColors.backgroundWhite],
  });
  const tintColor = colorTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.white, AppColors.backgroundBlack],
  });

  return (
    <AnimatedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity onPress={() => navigation.navigate("MainAppBottomTabs")}>
        <Animated.Image
          source={images.appLogo}
          style={[styles.logo, { tintColor }]}
        />
      </TouchableOpacity>
    </AnimatedSafeAreaView>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: vs(10),
  },
  logo: {
    height: vs(40),
    width: s(40),
    tintColor: AppColors.white,
  },
});
