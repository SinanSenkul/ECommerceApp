import { StyleSheet, View, FlatList } from "react-native";
import React from "react";
import HomeHeader from "../../components/headers/HomeHeader";
import AppSafeView from "../../components/views/AppSafeView";
import EmptyCart from "./EmptyCart";
import CartItem from "../../components/cart/CartItem";
import TotalsView from "../../components/cart/TotalsView";
import { sharedStyles } from "../../styles/sharedStyles";
import AppButton from "../../components/buttons/AppButton";
import { useNavigation } from "@react-navigation/native";
import { vs } from "react-native-size-matters";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem } from "../../store/reducers/cartSlice";
import { fee, tax } from "../../constants/constants";
import { AppColors } from "../../styles/colors";
import { useTranslation } from "react-i18next";
import { requireVerifiedUser } from "../../helpers/authGuards";

const CartScreen = () => {
  const navigation = useNavigation();
  const { items } = useSelector((state: RootState) => state.cartSlice);
  const price = items.reduce((acc, item) => acc + item.price, 0); //sum up all the prices
  const sum = price > 0 ? price + tax + fee : 0;

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    textColor: isNight ? AppColors.white : AppColors.black,
  };

  const dispatch = useDispatch();
  const { t } = useTranslation(); //localization
  const goToCheckout = async () => {
    if (sum <= 0) {
      return;
    }

    const verifiedUser = await requireVerifiedUser(t);
    if (verifiedUser) {
      navigation.navigate("CheckoutScreen");
    }
  };

  return (
    <AppSafeView
      style={[
        { flex: 1, flexDirection: "column" },
        { backgroundColor: lightMode.backgroundColor },
      ]}
    >
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
                  onDeletePress={() => dispatch(deleteItem(item.id))}
                />
              )}
            />
            <TotalsView price={price} sum={sum} />
            <AppButton
              title={t("Pay")}
              onPress={goToCheckout}
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

export default CartScreen;

const styles = StyleSheet.create({
  payButtonActive: {
    marginVertical: vs(5),
  },
  payButtonInactive: {
    marginVertical: vs(5),
    backgroundColor: AppColors.disabledGray,
  },
});
