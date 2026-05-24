import { createSlice } from "@reduxjs/toolkit";

interface AppColorState {
  mode: string;
}

const state: AppColorState = {
  mode: "",
};

const appColorSlice = createSlice({
  name: "appColor",
  initialState: "dayMode" as string,
  reducers: {
    switchLightMode: (state) => {
      return state === "dayMode" ? "nightMode" : "dayMode";
    },
    switchToDayMode:(state)=>{
      return "dayMode"
    }
  },
});

export const { switchLightMode, switchToDayMode } = appColorSlice.actions;
export default appColorSlice.reducer;
