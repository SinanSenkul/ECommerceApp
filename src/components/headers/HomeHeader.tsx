import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import { images } from "../../constants/image-paths";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

interface HomeHeaderProps {
  showBackButton?: boolean;
}

const HomeHeader = ({ showBackButton = false }: HomeHeaderProps) => {
  const navigation = useNavigation<any>();

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
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={s(28)}
              color={isNight ? AppColors.backgroundBlack : AppColors.white}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate("MainAppBottomTabs")}
        >
          <Animated.Image
            source={images.appLogo}
            style={[styles.logo, { tintColor }]}
          />
        </TouchableOpacity>
      </View>
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
  headerContent: {
    alignItems: "center",
    flexDirection: "row",
    height: vs(40),
    justifyContent: "center",
    width: "100%",
  },
  backButton: {
    height: vs(40),
    justifyContent: "center",
    left: s(16),
    position: "absolute",
    zIndex: 1,
  },
  logo: {
    height: vs(40),
    width: s(40),
    tintColor: AppColors.white,
  },
});
