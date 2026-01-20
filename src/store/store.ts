
import {configureStore} from '@reduxjs/toolkit'
import cartSlice from './reducers/cartSlice';
import userSlice from './reducers/userSlice';

export const store = configureStore({
  reducer: {
    cartSlice,
    userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;