
import {configureStore} from '@reduxjs/toolkit'
import cartSlice from './reducers/cartSlice';
import userSlice from './reducers/userSlice';
import languageSlice from './reducers/languageSlice';

export const store = configureStore({
  reducer: {
    cartSlice,
    userSlice,
    languageSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;