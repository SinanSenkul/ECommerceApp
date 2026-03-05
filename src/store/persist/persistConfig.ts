import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartSlice from "../reducers/cartSlice";

const persistConfig = {
  key: "cart",
  storage: AsyncStorage,
  whiteList: ["items"],
};

export const persistedCartSlice = persistReducer(persistConfig, cartSlice);
