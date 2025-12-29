import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { FC, useState } from 'react'
import { s, vs } from "react-native-size-matters";
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/colors';
import { AppFonts } from '../../styles/fonts';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

interface ICartItem {
  imageURL?: string;
  title?: string;
  price?: number | string;
  qty?: number;
  onDeletePress?: () => void;
  onIncreasePress?: () => void;
  onDecreasePress?: () => void;
}

const CartItem: FC<ICartItem> = ({
  imageURL,
  title,
  price,
  qty,
  onDeletePress,
  onIncreasePress,
  onDecreasePress,
}) => {
  const [imgSource, setImgSource] = useState(imageURL);
  const handleImageError=()=>{
    setImgSource("https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg")
  }
  return (
    <Pressable style={styles.container}>
      {/* image container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imgSource }} onError={handleImageError} style={styles.image} />
      </View>
      {/* details container */}
      <View style={styles.detailsContainer}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.price}>{price}₺</AppText>
        <View style={styles.qtyContainer}>
          <Pressable style={styles.qtyButton} onPress={onIncreasePress}>
            <FontAwesome name="plus" size={s(14)} color={AppColors.primary} />
          </Pressable>
          <AppText style={styles.qtyNumber}>{qty}</AppText>
          <Pressable style={styles.qtyButton} onPress={onDecreasePress}>
            <FontAwesome name="minus" size={s(14)} color={AppColors.primary} />
          </Pressable>
        </View>
      </View>
      {/* delete button container */}
      <View style={styles.deleteContainer}>
        <Pressable style={styles.deletePressable} onPress={onDeletePress}>
          <AntDesign name="delete" size={s(14)} color={AppColors.red} />
          <AppText style={styles.deleteText}>Delete</AppText>
        </Pressable>
      </View>
    </Pressable>
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
  qtyContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: s(5),
    borderRadius: s(30),
    borderWidth: s(1),
    borderColor: AppColors.blueGray,
    width: s(80),
    paddingVertical: vs(5),
  },
  qtyButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.lightGray,
    padding: s(5),
    height: s(22),
    width: s(22),
    borderRadius: s(11),
  },
  qtyNumber: {
    flex: 1,
    textAlign: "center",
    color: AppColors.primary,
  },
});