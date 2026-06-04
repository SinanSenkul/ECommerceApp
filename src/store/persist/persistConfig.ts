import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import appColorSlice from "../reducers/appColorSlice";
import cartSlice from "../reducers/cartSlice";

const cartPersistConfig = {
  key: "cart",
  storage: AsyncStorage,
  whitelist: ["items"],
};

const appColorPersistConfig = {
  key: "appColor",
  storage: AsyncStorage,
  whitelist: ["mode"],
};

export const persistedCartSlice = persistReducer(cartPersistConfig, cartSlice);
export const persistedAppColorSlice = persistReducer(
  appColorPersistConfig,
  appColorSlice,
);
