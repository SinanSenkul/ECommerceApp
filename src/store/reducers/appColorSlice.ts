import { createSlice } from "@reduxjs/toolkit";

interface AppColorState {
  mode: string;
}

const state: AppColorState = {
  mode: "dayMode",
};

const appColorSlice = createSlice({
  name: "appColor",
  initialState: state,
  reducers: {
    switchLightMode: (state) => {
      if (state.mode === "dayMode") {
        state.mode = "nightMode";
      } else {
        state.mode = "dayMode";
      }
    },
    switchToDayMode: (state) => {
      state.mode = "dayMode";
    },
  },
});

export const { switchLightMode, switchToDayMode } = appColorSlice.actions;
export default appColorSlice.reducer;
