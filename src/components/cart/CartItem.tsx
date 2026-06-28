import { StyleSheet, View, Image, Pressable } from "react-native";
import React, { FC, useState } from "react";
import { s, vs } from "react-native-size-matters";
import AppText from "../texts/AppText";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../helpers/currency";

interface ICartItem {
  imageURL?: string;
  title?: string;
  price?: number | string;
  currency?: string;
  onDeletePress?: () => void;
}

const CartItem: FC<ICartItem> = ({
  imageURL,
  title,
  price,
  currency,
  onDeletePress,
}) => {
  const [imgSource, setImgSource] = useState(imageURL);
  const handleImageError = () => {
    setImgSource(
      "https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg",
    );
  };

  const { t } = useTranslation();
  return (
    <Pressable style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgSource }}
          onError={handleImageError}
          style={styles.image}
        />
      </View>
      <View style={styles.detailsContainer}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.price}>{formatPrice(price, currency)}</AppText>
      </View>
      <View style={styles.deleteContainer}>
        <Pressable style={styles.deletePressable} onPress={onDeletePress}>
          <AntDesign name="delete" size={s(14)} color={AppColors.red} />
          <AppText style={styles.deleteText}>{t("Delete")}</AppText>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 0.75,
    paddingBottom: vs(4),
    borderColor: AppColors.blueGray,
    gap: s(10),
  },
  imageContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 3.5,
  },
  deleteContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingEnd: s(8),
  },
  image: {
    height: vs(80),
    width: s(80),
    borderRadius: s(5),
  },
  title: {
    fontSize: s(14),
    color: AppColors.primary,
    fontFamily: AppFonts.Medium,
    marginTop: vs(5),
  },
  price: {
    fontSize: s(16),
    color: AppColors.primary,
    fontFamily: AppFonts.Bold,
    marginVertical: vs(5),
  },
  deleteText: {
    marginLeft: s(7),
    fontFamily: AppFonts.Medium,
    color: AppColors.medGray,
    fontSize: s(12),
    marginTop: vs(3),
  },
  deletePressable: {
    flexDirection: "row",
    alignItems: "center",
  },
});
