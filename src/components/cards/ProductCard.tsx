import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { FC, useState } from 'react'
import { s,vs } from 'react-native-size-matters'
import { AppColors } from '../../styles/colors'
import AppText from '../texts/AppText'
import { AppFonts } from '../../styles/fonts'
import { Ionicons } from '@expo/vector-icons'
import { AppStyles } from '../../styles/sharedStyles'
import { useSelector } from 'react-redux'

interface ProductCardProps {
  price: number;
  title: string;
  imageURL: string;
  onAddToCartPress: () => void;
  qty: number
}

const ProductCard: FC<ProductCardProps> = ({
  price,
  title,
  imageURL,
  qty=0,
  onAddToCartPress,
}) => {
  const [imgSource, setImgSource] = useState(imageURL);
  const handleImageError = () => {
    setImgSource(
      "https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg"
    );
  };
  return (
    <View style={[styles.container, AppStyles.shadow]}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={onAddToCartPress}
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
        <AppText style={styles.titleText}>{title}</AppText>
        <AppText style={styles.priceText}>{price} ₺</AppText>
      </View>
    </View>
  );
};

export default ProductCard

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
    height: vs(130),
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  detailsContainer: {
    flex: 1,
    paddingTop: s(8),
    paddingBottom: vs(15),
    paddingHorizontal: s(10),
  },
  titleText: {
    fontSize: s(14),
    fontFamily: AppFonts.Medium,
    color: AppColors.primary,
  },
  priceText: {
    fontSize: s(14),
    fontFamily: AppFonts.Bold,
    color: AppColors.primary,
    marginTop: vs(7),
  },
  addToCartButton: {
    height: s(28),
    width: s(28),
    position: "absolute",
    left: 5,
    top: 5,
    borderRadius: s(14),
    backgroundColor: AppColors.primary,
    zIndex:1,
    alignItems:"center",
    justifyContent:"center"
  }
});