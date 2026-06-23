import { StyleSheet, View } from "react-native";
import React, { FC, useEffect, useState } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import AppText from "../texts/AppText";
import { AppFonts } from "../../styles/fonts";
import { AppStyles } from "../../styles/sharedStyles";
import { formatFirestoreDate } from "../../helpers/dateFormatter";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface IOrderItem {
  totalPrice?: number;
  date?: Date | string;
  status?: "ordered" | "shipped";
  items?: Array<{
    id?: string | number;
    title?: string;
    status?: "ordered" | "shipped";
  }>;
}

const OrderItem: FC<IOrderItem> = ({
  totalPrice,
  date,
  status = "ordered",
  items = [],
}) => {
  const [dateStringified, setDateStringified] = useState(date);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.blueGray,
    separatorColor: isNight ? AppColors.medGray : AppColors.blueGray,
  };

  useEffect(() => {
    if (typeof date !== "string") {
      let newDate = formatFirestoreDate(date);
      setDateStringified(newDate);
    }
  }, []);

  const { t } = useTranslation(); //localization
  const visibleItems = items.filter((item) => item.title);
  const productName = visibleItems.map((item) => item.title).join(", ");
  const statusText = status === "shipped" ? t("Shipped") : t("Ordered");

  return (
    <View
      style={[
        styles.container,
        AppStyles.shadow,
        {
          backgroundColor: lightMode.backgroundColor,
          borderColor: lightMode.borderColor,
        },
      ]}
    >
      <AppText style={styles.title}>{t("ORDER DETAILS:")}</AppText>
      <View
        style={[
          styles.separator,
          { borderBottomColor: lightMode.separatorColor },
        ]}
      ></View>
      {visibleItems.length > 1 ? (
        visibleItems.map((item, index) => (
          <AppText
            key={`${item.id ?? item.title}-${index}`}
            style={styles.text}
          >
            {t("Product:")} {item.title} : {t("Status:")} {" "}
            {(item.status ?? status) === "shipped"
              ? t("Shipped")
              : t("Ordered")}
          </AppText>
        ))
      ) : productName.length > 0 ? (
        <AppText style={styles.text}>
          {t("Product:")} {productName}
        </AppText>
      ) : null}
      {visibleItems.length <= 1 && (
        <AppText style={styles.text}>
          {t("Status:")} {statusText}
        </AppText>
      )}
      <AppText style={styles.text}>{t("Total Price:")} {totalPrice} ₺</AppText>
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
