import { FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import OrderItem from "../../components/orders/OrderItem";
import AppButton from "../../components/buttons/AppButton";
import { useNavigation } from "@react-navigation/native";
import { vs } from "react-native-size-matters";
import { getUserOrders } from "../../config/dataServices";
import AppSafeView from "../../components/views/AppSafeView";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppColors } from "../../styles/colors";
import HomeHeader from "../../components/headers/HomeHeader";

interface OrderListItem {
  id: string;
  priceSum?: number;
  createDate?: Date | string;
}

const MyOrdersScreen = () => {
  const navigation = useNavigation();
  const [orderList, setOrderList] = useState<OrderListItem[]>([]);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
  };

  const getOrders = async () => {
    const res = await getUserOrders();
    setOrderList((res ?? []) as OrderListItem[]);
  };

  useEffect(() => {
    getOrders();
  }, []);

  const { t } = useTranslation(); //localization

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader/>
      <FlatList
        style={{ width: "100%" }}
        data={orderList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // console.log(JSON.stringify(item, null, 3));

          return (
            <OrderItem totalPrice={item.priceSum} date={item.createDate} />
          );
        }}
      />

      <AppButton
        title={t("Back")}
        onPress={() => navigation.goBack()}
        style={{ marginTop: vs(10) }}
      />
    </AppSafeView>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
});
