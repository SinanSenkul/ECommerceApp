import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { s, vs } from "react-native-size-matters";
import AppText from "../texts/AppText";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { tax, fee } from "../../constants/constants";
import { useTranslation } from "react-i18next";

interface ITotalView {
  price?: number;
  sum?: number;
}

const TotalsView: FC<ITotalView> = ({ price, sum }) => {
  const { t } = useTranslation(); //localization
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText style={styles.title}>{t("Item Price")}:</AppText>
        <AppText>{price} ₺</AppText>
      </View>
      <View style={styles.row}>
        <AppText style={styles.title}>{t("Taxes")}:</AppText>
        <AppText>{tax} ₺</AppText>
      </View>
      <View style={styles.row}>
        <AppText style={styles.title}>{t("Shipping Fee")}:</AppText>
        <AppText>{fee} ₺</AppText>
      </View>
      <View style={styles.separator} />
      <View style={styles.row}>
        <AppText style={styles.title}>{t("Sum")}:</AppText>
        <AppText>{sum}₺</AppText>
      </View>
    </View>
  );
};

export default TotalsView;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(5),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: vs(5),
  },
  title: {
    fontSize: s(16),
    flex: 1,
    fontFamily: AppFonts.Bold,
  },
  price: {
    fontSize: s(16),
    color: AppColors.primary,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.blueGray,
    width: "90%",
    alignSelf: "center",
    borderWidth: s(0.75),
    opacity: 0.25,
    marginVertical: vs(5),
  },
});
