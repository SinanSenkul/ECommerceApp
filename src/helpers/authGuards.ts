import { showMessage } from "react-native-flash-message";
import { auth } from "../config/firebase";

export const requireVerifiedUser = async (
  translate: (key: string) => string,
) => {
  const user = auth.currentUser;

  if (!user) {
    showMessage({
      message: translate("You must sign up to add it to your card"),
      type: "none",
      duration: 2000,
      floating: true,
      icon: "info",
    });
    return null;
  }

  await user.reload();
  const refreshedUser = auth.currentUser;

  if (!refreshedUser?.emailVerified) {
    showMessage({
      message: translate("Please verify your email before continuing"),
      type: "info",
      duration: 2000,
      floating: true,
      icon: "info",
      position: "top",
    });
    return null;
  }

  return refreshedUser;
};
