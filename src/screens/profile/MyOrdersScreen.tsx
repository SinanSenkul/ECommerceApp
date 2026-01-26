import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import OrderItem from "../../components/orders/OrderItem";
import AppButton from "../../components/buttons/AppButton";
import { useNavigation } from "@react-navigation/native";
import { vs } from "react-native-size-matters";
import { orders } from "../../data/orders";
import { getUserOrders } from "../../config/dataServices";
import AppSafeView from "../../components/views/AppSafeView";
import { useTranslation } from "react-i18next";

const MyOrdersScreen = () => {
  const navigation = useNavigation();
  const [orderList, setOrderList] = useState([]);

  const getOrders = async () => {
    const res = await getUserOrders();
    // console.log("*** ORDERLIST ***: ", res);
    setOrderList(res);
  };

  useEffect(() => {
    getOrders();
  }, []);

  const { t } = useTranslation(); //localization

  return (
    <AppSafeView style={styles.container}>
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
    flexDirection: "column",
    marginTop: vs(5),
  },
});
