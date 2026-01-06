import { StyleSheet, View, FlatList } from 'react-native'
import React from 'react'
import HomeHeader from '../../components/headers/HomeHeader'
import AppSafeView from '../../components/views/AppSafeView'
import EmptyCart from './EmptyCart'
import CartItem from '../../components/cart/CartItem'
import TotalsView from '../../components/cart/TotalsView'
import { products } from '../../data/products'
import { sharedStyles } from '../../styles/sharedStyles'
import AppButton from '../../components/buttons/AppButton'
import { useNavigation } from '@react-navigation/native'
import { vs } from 'react-native-size-matters'
import { RootState } from '../../store/store'
import { useDispatch, useSelector } from "react-redux";
import { decreaseQty, deleteItem, increaseQty } from '../../store/reducers/cartSlice'
import { fee, tax } from '../../constants/constants'
import { AppColors } from '../../styles/colors'


const CartScreen = () => {
  const navigation = useNavigation();
  const {items} = useSelector((state: RootState) => state.cartSlice);
  const price = items.reduce((acc, item) => acc + item.price * item.qty, 0); //sum up all the prices
  const sum = price > 0 ? price + tax + fee : 0;

  const dispatch = useDispatch();

  return (
    <AppSafeView style={{ flex: 1, flexDirection: "column" }}>
      <HomeHeader />
      <View
        style={{
          paddingHorizontal: sharedStyles.paddingHorizontal,
          flex: 1,
        }}
      >
        {items.length > 0 ? (
          <>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <CartItem
                  {...item}
                  price={item.price * item.qty}
                  onDeletePress={() => dispatch(deleteItem(item.id))}
                  onIncreasePress={() => dispatch(increaseQty(item))}
                  onDecreasePress={() => dispatch(decreaseQty(item))}
                />
              )}
            />
            <TotalsView price={price} sum={sum} />
            <AppButton
              title="Pay"
              onPress={() =>
                sum > 0 ? navigation.navigate("CheckoutScreen") : null
              }
              style={
                sum > 0 ? styles.payButtonActive : styles.payButtonInactive
              }
            />
          </>
        ) : (
          <EmptyCart />
        )}
      </View>
    </AppSafeView>
  );
};

export default CartScreen

const styles = StyleSheet.create({
  payButtonActive: {
    marginVertical: vs(5),
  },
  payButtonInactive:{
    marginVertical: vs(5),
    backgroundColor: AppColors.disabledGray
  }
});