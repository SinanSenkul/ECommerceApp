import { Alert } from "react-native";
import { sendEmailVerification } from "firebase/auth";
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

  if (!refreshedUser) {
    return null;
  }

  if (!refreshedUser.emailVerified) {
    const unverifiedUser = refreshedUser;
    Alert.alert(
      translate("Please verify your email before continuing"),
      translate("Send a new verification email to continue."),
      [
        { text: translate("Cancel"), style: "cancel" },
        {
          text: translate("Resend verification email"),
          onPress: async () => {
            try {
              await sendEmailVerification(unverifiedUser);
              showMessage({
                message: translate("Verification email sent"),
                type: "success",
                duration: 1800,
                floating: true,
                icon: "success",
                position: "top",
              });
            } catch (error) {
              console.error("verification email could not be sent: ", error);
              showMessage({
                message: translate("Could not send verification email"),
                type: "danger",
                duration: 1800,
                floating: true,
                icon: "danger",
                position: "top",
              });
            }
          },
        },
      ],
    );
    return null;
  }

  return refreshedUser;
};
