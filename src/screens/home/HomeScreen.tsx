import { StyleSheet, View, Text, Alert } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import ProductCard from "../../components/cards/ProductCard";
import { FlatList } from "react-native-gesture-handler";
import { products } from "../../data/products";
import { s, vs } from "react-native-size-matters";
import { showMessage } from "react-native-flash-message";

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <AppSafeView style={styles.container}>
      <HomeHeader />
      <FlatList
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: vs(5),
          paddingHorizontal:s(3)
        }}
         contentContainerStyle={{ paddingBottom: 80 }}
        numColumns={2}
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            price={item.price}
            title={item.title}
            imageURL={item.imageURL}
            onAddToCartPress={() =>
              showMessage({
                message: "Added to Card",
                type: "success",
                duration: 1000,
                floating: true,
                icon: "success",
              })
            }
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </AppSafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  listContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
