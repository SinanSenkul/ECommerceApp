import { FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import OrderItem from "../../components/orders/OrderItem";
import { getUserOrders } from "../../config/dataServices";
import AppSafeView from "../../components/views/AppSafeView";
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

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader showBackButton />
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
