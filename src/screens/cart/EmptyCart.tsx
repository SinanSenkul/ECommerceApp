import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { s, vs } from "react-native-size-matters";
import AppText from "../../components/texts/AppText";
import { AppFonts } from "../../styles/fonts";
import AppButton from "../../components/buttons/AppButton";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../styles/colors";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const EmptyCart = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); //localization

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#121212" : "#FFFFFF",
    textColor: isNight ? "#FFFFFF" : "#121212",
    iconColor: isNight? "#FFFFFF" : AppColors.primary
  };

  return (
    <View style={[styles.container, {backgroundColor:lightMode.backgroundColor}]}>
      <MaterialCommunityIcons
        name="shopping-outline"
        size={90}
        style={{ marginBottom: vs(5), opacity: 0.1 }}
        color={lightMode.iconColor}
      />
      <AppText style={styles.title}>{t("Your Cart is Empty")}</AppText>
      <AppButton
        title={t("Start Shopping")}
        onPress={() => navigation.navigate("HomeScreen")}
      ></AppButton>
    </View>
  );
};

export default EmptyCart;

const styles = StyleSheet.create({
  container: {
    flex:1,
    
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: s(10),
  },
  title: {
    fontSize: s(20),
    fontFamily: AppFonts.Bold,
    marginBottom: vs(10),
  },
});
