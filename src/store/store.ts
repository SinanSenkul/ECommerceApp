
import {configureStore} from '@reduxjs/toolkit'
import cartSlice from './reducers/cartSlice';

export const store = configureStore({
  reducer: {
    cartSlice: cartSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;