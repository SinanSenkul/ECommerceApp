import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number | string;
  price: number;
  title: string;
  imageURL: string;
}

interface CartState {
  items: CartItem[];
}

const state: CartState = {
  items: [],
};

const toCartItem = (item: Partial<CartItem>): CartItem => ({
  id: item.id ?? "",
  price: Number(item.price ?? 0),
  title: item.title ?? "",
  imageURL: item.imageURL ?? "",
});

const cartSlice = createSlice({
  name: "cart",
  initialState: state,
  reducers: {
    addItem: {
      reducer: (state, action: PayloadAction<CartItem>) => {
        state.items = state.items.map(toCartItem);
        const cartItem = action.payload;
        const itemInCart = state.items.find(
          (item) => item.id === cartItem.id,
        );
        if (!itemInCart) {
          state.items.push(cartItem);
        }
      },
      prepare: (item: Partial<CartItem>) => ({
        payload: toCartItem(item),
      }),
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    emptyItems: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, deleteItem, emptyItems } =
  cartSlice.actions;
export default cartSlice.reducer;
