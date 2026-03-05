import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  userData: object;
}

const state: UserState = {
  userData: {},
};

const saveUserLocalData = async (data) => {
  try {
    await AsyncStorage.setItem("user-data", JSON.stringify(data));
  } catch (e) {
    console.error("user data couldn't be saved: ", e);
  }
};

const deleteUserLocalData = async () => {
  try {
    await AsyncStorage.setItem("logged-in", "false");
    await AsyncStorage.setItem("user-data", "");
  } catch (e) {
    console.error("user data couldn't be deleted: ", e);
  }
};

const userSlice = createSlice({
  name: "userData",
  initialState: state,
  reducers: {
    setUserData: (state, action: PayloadAction<object>) => {
      state.userData = action.payload;
      saveUserLocalData(action.payload);
    },
    deleteUserData: (state) => {
      state.userData = {};
      deleteUserLocalData();
    },
  },
});

export const { setUserData, deleteUserData } = userSlice.actions;
export default userSlice.reducer;
