import AsyncStorage from "@react-native-async-storage/async-storage";

export const LoggedIn = async () => {
  try {
    await AsyncStorage.setItem("logged-in", "true");
  } catch (e) {
    console.error("login error: ", e);
  }
};
