import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  userData: object;
}

const state: UserState = {
  userData: {},
};

const toSerializableValue = (value: unknown): unknown => {
  if (value && typeof value === "object") {
    if (
      "toDate" in value &&
      typeof (value as { toDate?: unknown }).toDate === "function"
    ) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(toSerializableValue);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        toSerializableValue(item),
      ]),
    );
  }

  return value;
};

const toSerializableUserData = (data: object): object =>
  toSerializableValue(data) as object;

const saveUserLocalData = async (data: object) => {
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
    setUserData: {
      reducer: (state, action: PayloadAction<object>) => {
        state.userData = action.payload;
        saveUserLocalData(action.payload);
      },
      prepare: (data: object) => ({
        payload: toSerializableUserData(data),
      }),
    },
    deleteUserData: (state) => {
      state.userData = {};
      deleteUserLocalData();
    },
  },
});

export const { setUserData, deleteUserData } = userSlice.actions;
export default userSlice.reducer;
