import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { FC } from 'react'
import { s, vs } from "react-native-size-matters";
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/colors';
import { AppFonts } from '../../styles/fonts';
import { AntDesign } from '@expo/vector-icons';

interface ICartItem{
    imageURL?: string,
    title?: string,
    price?: number,

}

const CartItem: FC<ICartItem> = ({imageURL, title, price}) => {
  return (
    <View style={styles.container}>
      {/* image container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageURL }} style={styles.image} />
      </View>
      {/* details container */}
      <View style={styles.detailsContainer}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.price}>{price}</AppText>
      </View>
      {/* delete button container */}
      <View style={styles.deleteContainer}>
        <Pressable style={styles.deletePressable}>
          <AntDesign name="delete" size={s(14)} color={AppColors.red}/>
          <AppText style={styles.deleteText}>Delete</AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default CartItem

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 0.75,
    paddingBottom: vs(4),
    borderColor: AppColors.blueGray,
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