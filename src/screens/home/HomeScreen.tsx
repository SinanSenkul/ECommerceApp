import { StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import ProductCard from "../../components/cards/ProductCard";
import { FlatList } from "react-native-gesture-handler";
import { s, vs } from "react-native-size-matters";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../store/reducers/cartSlice";
import { getProductsData } from "../../config/dataServices";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import { RootState } from "../../store/store";

const HomeScreen = () => {
  const { items } = useSelector((state: RootState) => state.cartSlice);
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchData = async () => {
    const data = await getProductsData();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const { t } = useTranslation();

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? "#121212" : "#FFFFFF",
    textColor: isNight ? "#FFFFFF" : "#121212",
  };

  const onAddtoCartHandler = (item: any) => {
    if (user) {
      if (items.some((cartItem) => cartItem.id === item.id)) {
        showMessage({
          message: t("Item is already in your cart"),
          type: "info",
          duration: 1000,
          floating: true,
          icon: "info",
        });
        return;
      }

      showMessage({
        message: t("Added to Card"),
        type: "success",
        duration: 1000,
        floating: true,
        icon: "success",
      });
      dispatch(
        addItem({
          id: item.id,
          title: item.title,
          price: item.price,
          imageURL: item.imageURL,
        }),
      );
    } else {
      showMessage({
        message: t("You must sign up to add it to your card"),
        type: "none",
        duration: 2000,
        floating: true,
        icon: "success",
      });
    }
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader />
      <FlatList
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: vs(5),
          paddingHorizontal: s(3),
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        numColumns={2}
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            price={item.price}
            title={item.title}
            imageURL={item.imageURL ?? ""}
            // onAddToCartPress={() => {
            //   showMessage({
            //     message: t("Added to Card"),
            //     type: "success",
            //     duration: 1000,
            //     floating: true,
            //     icon: "success",
            //   });
            //   dispatch(addItem(item));
            // }}
            onAddToCartPress={() => onAddtoCartHandler(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </AppSafeView>
  );
};

const styles = StyleSheet.create({
  container: {},
  listContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
