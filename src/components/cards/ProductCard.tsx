import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React, { FC, useState } from "react";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";
import AppText from "../texts/AppText";
import { AppFonts } from "../../styles/fonts";
import { Ionicons } from "@expo/vector-icons";
import { AppStyles } from "../../styles/sharedStyles";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface ProductCardProps {
  price: number;
  title: string;
  imageURL: string;
  onAddToCartPress: () => void;
  onPress?: () => void;
}

const ProductCard: FC<ProductCardProps> = ({
  price,
  title,
  imageURL,
  onAddToCartPress,
  onPress,
}) => {
  const [imgSource, setImgSource] = useState(imageURL);
  const handleImageError = () => {
    setImgSource(
      "https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg",
    );
  };

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.inkBlack : AppColors.white,
    textColor: isNight ? AppColors.white : AppColors.black,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.container,
        AppStyles.shadow,
        { backgroundColor: lightMode.backgroundColor },
      ]}
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={(event) => {
            event.stopPropagation();
            onAddToCartPress();
          }}
        >
          <Ionicons name="cart-outline" color={AppColors.white} size={s(15)} />
        </TouchableOpacity>
        <Image
          style={styles.image}
          source={{
            uri: imgSource,
          }}
          onError={handleImageError}
        />
      </View>
      <View style={styles.detailsContainer}>
        <AppText style={styles.titleText} numberOfLines={1}>
          {title}
        </AppText>
        <AppText style={styles.priceText}>{price} ₺</AppText>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    width: s(160),
    height: vs(190),
    backgroundColor: AppColors.white,
    borderRadius: s(10),
    borderWidth: s(0.5),
    marginTop: vs(3),
    marginHorizontal: vs(3),
  },
  imageContainer: {
    overflow: "hidden",
    borderTopLeftRadius: s(10),
    borderTopRightRadius: s(10),
    height: vs(155),
    width: "100%",
    backgroundColor: AppColors.white,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: s(8),
    paddingTop: s(2),
    paddingBottom: vs(2),
    paddingHorizontal: s(10),
  },
  titleText: {
    flex: 1,
    fontSize: s(14),
    fontFamily: AppFonts.Medium,
    color: AppColors.primary,
    textAlign: "left",
  },
  priceText: {
    flexShrink: 0,
    fontSize: s(14),
    fontFamily: AppFonts.Bold,
    color: AppColors.primary,
    textAlign: "right",
  },
  addToCartButton: {
    height: s(28),
    width: s(28),
    position: "absolute",
    left: 5,
    top: 5,
    borderRadius: s(14),
    backgroundColor: AppColors.primary,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
