import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number | string;
  price: number;
  title: string;
  qty: number;
  imageURL: string;
}

interface CartState {
  items: CartItem[];
}

const state : CartState = {
    items:[],
}

const cartSlice = createSlice({
  name: "cart",
  initialState: state,
  reducers: {
    addItem: (state, action) => {
      const itemInCart = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (!itemInCart) {
        state.items.push({ ...action.payload, qty: 1 });
      } else {
        itemInCart.qty++;
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    increaseQty: (state, action) => {
      state.items = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    },
    decreaseQty: (state, action) => {
      state.items = state.items.map(item =>
        item.id === action.payload.id && item.qty>0
          ? { ...item, qty: item.qty - 1 }
          : item
      );
      state.items = state.items.filter((item) => item.qty > 0); //filter items with qty>0, delete 0 qty ones
    },
  },
});

export const {addItem, deleteItem, increaseQty, decreaseQty} = cartSlice.actions;
export default cartSlice.reducer;