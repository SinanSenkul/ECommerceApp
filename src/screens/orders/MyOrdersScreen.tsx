import { FlatList, StyleSheet } from "react-native";
import React, { useState } from "react";
import OrderItem from "../../components/orders/OrderItem";
import { getUserOrders } from "../../config/dataServices";
import AppSafeView from "../../components/views/AppSafeView";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppColors } from "../../styles/colors";
import HomeHeader from "../../components/headers/HomeHeader";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { requireVerifiedUser } from "../../helpers/authGuards";

interface OrderListItem {
  id: string;
  priceSum?: number;
  createDate?: Date | string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  };
  status?: "ordered" | "shipped";
  items?: Array<{
    title?: string;
  }>;
}

const getOrderTime = (order: OrderListItem) => {
  if (typeof order.createdAt?.seconds === "number") {
    return (
      order.createdAt.seconds * 1000 +
      Math.floor((order.createdAt.nanoseconds ?? 0) / 1000000)
    );
  }

  if (typeof order.createDate === "string") {
    const [day, month, year] = order.createDate.split(".").map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day).getTime();
    }
  }

  return 0;
};

const MyOrdersScreen = () => {
  const { t } = useTranslation();
  const [orderList, setOrderList] = useState<OrderListItem[]>([]);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
  };

  const getOrders = async () => {
    const verifiedUser = await requireVerifiedUser(t);
    if (!verifiedUser) {
      setOrderList([]);
      return;
    }

    const res = await getUserOrders();
    const sortedOrders = ((res ?? []) as OrderListItem[]).sort(
      (firstOrder, secondOrder) =>
        getOrderTime(secondOrder) - getOrderTime(firstOrder),
    );
    setOrderList(sortedOrders);
  };

  useFocusEffect(
    React.useCallback(() => {
      getOrders();
    }, []),
  );

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
            <OrderItem
              totalPrice={item.priceSum}
              date={item.createDate}
              status={item.status}
              items={item.items}
            />
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
