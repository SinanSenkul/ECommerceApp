import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import dayNightModeSlice from "../reducers/dayNightModeSlice";
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
  dayNightModeSlice,
);
