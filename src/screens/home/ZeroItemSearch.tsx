import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { s, vs } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import AppText from "../../components/texts/AppText";
import { images } from "../../constants/image-paths";
import { AppColors } from "../../styles/colors";
import { RootState } from "../../store/store";

const ZeroItemSearch = () => {
  const { t } = useTranslation();
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";

  return (
    <View style={styles.container}>
      <Image
        source={images.searchWarning}
        style={[
          styles.icon,
          { tintColor: isNight ? AppColors.white : AppColors.inkBlack },
        ]}
      />
      <AppText style={styles.message}>
        {t("No results for your search query.")}
      </AppText>
    </View>
  );
};

export default ZeroItemSearch;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: s(24),
  },
  icon: {
    height: vs(130),
    resizeMode: "contain",
    width: s(130),
  },
  message: {
    marginTop: vs(14),
    textAlign: "center",
  },
});
