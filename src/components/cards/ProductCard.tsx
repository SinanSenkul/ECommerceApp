import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { s,vs } from 'react-native-size-matters'
import { AppColors } from '../../styles/colors'
import AppText from '../texts/AppText'
import { AppFonts } from '../../styles/fonts'
import { Ionicons } from '@expo/vector-icons'

const ProductCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Ionicons name="cart-outline" color={AppColors.white} size={s(15)} />
        </TouchableOpacity>
        <Image
          style={styles.image}
          source={{
            uri: "https://st-troy.mncdn.com/Content/media/ProductImg/original/mywx3tua-iphone-16-pro-max-256gb-desert-titanium-638617358742681589.jpg?width=785",
          }}
        />
      </View>
      <View style={styles.detailsContainer}>
        <AppText style={styles.titleText}>iphone 15</AppText>
        <AppText style={styles.priceText}>15 ₺</AppText>
      </View>
    </View>
  );
}

export default ProductCard

const styles = StyleSheet.create({
  container: {
    width: s(160),
    height: vs(190),
    backgroundColor: AppColors.white,
    borderRadius: s(10),
    borderWidth: s(0.5),
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
  },
});