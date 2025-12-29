import { Platform } from "react-native";

const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

export { isAndroid, isIOS };

export const tax = 15;
export const fee = 10;