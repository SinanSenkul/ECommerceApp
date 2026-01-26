import { StyleSheet, Text, View } from "react-native";
import React, { FC, useEffect, useState } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import AppText from "../texts/AppText";
import { AppFonts } from "../../styles/fonts";
import { AppStyles } from "../../styles/sharedStyles";
import { formatFirestoreDate } from "../../helpers/dateFormatter";
import { useTranslation } from "react-i18next";

interface IOrderItem {
  totalPrice?: number;
  date?: Date | string;
}

const OrderItem: FC<IOrderItem> = ({ totalPrice, date }) => {
  const [dateStringified, setDateStringified] = useState(date);

  useEffect(() => {
    if (typeof date !== "string") {
      let newDate = formatFirestoreDate(date);
      setDateStringified(newDate);
    }
  }, []);

  const { t } = useTranslation(); //localization

  return (
    <View style={[styles.container, AppStyles.shadow]}>
      <AppText style={styles.title}>{t("ORDER DETAILS:")}</AppText>
      <View style={styles.separator}></View>
      <AppText style={styles.text}>{t("Total Price:")} {totalPrice} ₺</AppText>
      {/* <AppText style={styles.text}>Date: {date?.toString()}</AppText> */}
      <AppText style={styles.text}>{t("Date:")} {dateStringified?.toString()}</AppText>
    </View>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    paddingVertical: vs(10),
    paddingHorizontal: s(5),
    backgroundColor: AppColors.white,
    borderRadius: s(10),
    borderWidth: s(0.5),
    marginTop: vs(5),
    alignSelf: "center",
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
  title: {
    fontFamily: AppFonts.Bold,
  },
  text: {
    fontFamily: AppFonts.Medium,
    marginVertical: vs(2),
  },
});
