import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userData: object;
}

const state: UserState = {
  userData: {},
};

const userSlice = createSlice({
  name: "userData",
  initialState: state,
  reducers: {
    setUserData: (state, action: PayloadAction<object>) => {
        state.userData = action.payload
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;