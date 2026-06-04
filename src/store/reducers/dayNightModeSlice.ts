import { createSlice } from "@reduxjs/toolkit";

interface DayNightModeState {
  mode: string;
}

const state: DayNightModeState = {
  mode: "dayMode",
};

const dayNightModeSlice = createSlice({
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

export const { switchLightMode, switchToDayMode } =
  dayNightModeSlice.actions;
export default dayNightModeSlice.reducer;
