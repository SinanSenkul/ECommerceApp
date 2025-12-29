import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import OrderItem from '../../components/orders/OrderItem'
import AppButton from '../../components/buttons/AppButton';
import { useNavigation } from "@react-navigation/native";
import { vs } from 'react-native-size-matters';
import { orders } from '../../data/orders';

const MyOrdersScreen = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <FlatList
        style={{ width: "100%" }}
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderItem totalPrice={item.totalPrice} date={item.date} />
        )}
      />

      <AppButton
        title="Back"
        onPress={() => navigation.navigate("ProfileScreen")}
        style={{ marginTop: vs(10) }}
      />
    </View>
  );
}

export default MyOrdersScreen

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginTop: vs(5),
  },
});