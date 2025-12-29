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
import { decreaseQty, deleteItem, increaseQty, removeNoQtyItem } from '../../store/reducers/cartSlice'


const CartScreen = () => {
  const navigation = useNavigation();
  const {items} = useSelector((state: RootState) => state.cartSlice);
  
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
      </View>
      <TotalsView />
      <AppButton
        title="Pay"
        onPress={() => navigation.navigate("CheckoutScreen")}
        style={styles.payButton}
      />
    </AppSafeView>
  );
};

export default CartScreen

const styles = StyleSheet.create({
  payButton: {
    marginVertical: vs(5),
  },
});