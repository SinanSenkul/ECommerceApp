import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./reducers/cartSlice";
import {
  persistedAppColorSlice,
  persistedCartSlice,
} from "./persist/persistConfig";
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

export const store = configureStore({
  reducer: {
    cartSlice: persistedCartSlice,
    appColor: persistedAppColorSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
