import { Alert, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import AppSafeView from "../../components/views/AppSafeView";
import { AppStyles, sharedStyles } from "../../styles/sharedStyles";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import HomeHeader from "../../components/headers/HomeHeader";
import AppButton from "../../components/buttons/AppButton";
import { fee, isIOS, tax } from "../../constants/constants";
import { useNavigation } from "@react-navigation/native";
import AppTextInputController from "../../components/inputs/AppTextInputController";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { showMessage } from "react-native-flash-message";
import { emptyItems } from "../../store/reducers/cartSlice";
import { useTranslation } from "react-i18next";
import { createStripePayment } from "../../services/paymentService";
import { useStripe } from "@stripe/stripe-react-native";
import { isStripeConfigured, stripeConfig } from "../../config/stripe";
import { requireVerifiedUser } from "../../helpers/authGuards";
import { normalizeCurrency } from "../../helpers/currency";
import {
  logCrashlyticsBreadcrumb,
  recordCrashlyticsError,
} from "../../services/crashlyticsService";

const CheckoutScreen = () => {
  const { t } = useTranslation();
  const [isPaying, setIsPaying] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.backgroundBlack : AppColors.backgroundWhite,
    textColor: isNight ? AppColors.white : AppColors.black,
    inputContainerBG: isNight ? AppColors.inkBlack : AppColors.backgroundWhite,
  };

  const schema = yup
    .object({
      fullName: yup.string().required(t("Name is required!")),
      emailAddress: yup
        .string()
        .email(t("This is not a valid email!"))
        .required(t("Email is required!"))
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          t("Invalid email format"),
        ),
      detailedAddress: yup
        .string()
        .min(15, t("Address must be at least 15 characters long"))
        .required(t("Detailed address is required!")),
    })
    .required();
  type formData = yup.InferType<typeof schema>;

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cartSlice);
  const currency = normalizeCurrency(items[0]?.currency);
  const user = auth.currentUser;

  const priceSum =
    items.reduce((acc, item) => acc + item.price, 0) + fee + tax;

  const { control, handleSubmit, reset } = useForm<formData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user?.email?.split("@")[0] ?? "",
      emailAddress: user?.email ?? "",
      detailedAddress: "",
    },
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const userProfile = userDoc.data() as
          | {
              firstName?: string;
              lastName?: string;
              address?: string;
              email?: string;
            }
          | undefined;
        const fullName = [userProfile?.firstName, userProfile?.lastName]
          .filter(Boolean)
          .join(" ");

        reset({
          fullName: fullName || user?.email?.split("@")[0] || "",
          emailAddress: userProfile?.email || user?.email || "",
          detailedAddress: userProfile?.address || "",
        });
      } catch (error) {
        console.error("error fetching user profile: ", error);
      }
    };

    loadUserProfile();
  }, [reset, user?.email]);

  const saveOrder = async (formData: formData) => {
    logCrashlyticsBreadcrumb("checkout_confirm_pressed", {
      currency,
      item_count: items.length,
    });

    try {
      const verifiedUser = await requireVerifiedUser(t);
      if (!verifiedUser) {
        return;
      }
      const checkoutUserId = verifiedUser.uid;

      if (!checkoutUserId) {
        Alert.alert(t("Sign-up failed"), t("User not found"));
        return;
      }

      if (items.length < 1) {
        Alert.alert(t("Order could not be completed"), t("Your Cart is Empty"));
        return;
      }

      if (items.some((item) => normalizeCurrency(item.currency) !== currency)) {
        Alert.alert(
          t("Order could not be completed"),
          t("You can only checkout items with the same currency"),
        );
        return;
      }

      setIsPaying(true);

      if (!isStripeConfigured) {
        recordCrashlyticsError(
          new Error("Payment system is not configured"),
          "checkout_payment_not_configured",
          { currency, item_count: items.length },
        );
        Alert.alert(
          t("Payment failed"),
          t("Payment system is not configured"),
        );
        return;
      }

      await createStripePayment({
        amount: priceSum,
        currency,
        itemIds: items.map((item) => item.id),
        userId: checkoutUserId,
        authToken: await verifiedUser.getIdToken(),
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        detailedAddress: formData.detailedAddress,
        endpoint: stripeConfig.paymentSheetEndpoint,
        merchantDisplayName: stripeConfig.merchantDisplayName,
        initPaymentSheet,
        presentPaymentSheet,
      });

      dispatch(emptyItems());
      navigation.goBack();
      logCrashlyticsBreadcrumb("checkout_payment_completed", {
        currency,
        item_count: items.length,
      });
      showMessage({
        message: t("Payment completed successfully"),
        type: "success",
        duration: 1000,
        floating: true,
        icon: "success",
        position: "top",
      });
    } catch (error) {
      console.error(t("Error saving order "), error);
      recordCrashlyticsError(error, "checkout_payment_failed", {
        currency,
        item_count: items.length,
      });
      const errorMessage =
        error instanceof Error && error.message === "Product is out of stock"
          ? t("Product is out of stock")
          : t("Payment failed");
      Alert.alert(t("Order could not be completed"), errorMessage);
    } finally {
      setIsPaying(false);
    }
  };

  // when text is written it'll be changed in global and if user goes back and again comes to checkout his information will be there
  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader />
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <AppButton
          title={t("Back")}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: lightMode.inputContainerBG },
          ]}
        >
          <AppTextInputController
            control={control}
            name={"fullName"}
            placeholder={t("Full Name")}
          />
          <AppTextInputController
            control={control}
            name={"emailAddress"}
            placeholder={t("Email Address")}
          />
          <AppTextInputController
            control={control}
            name={"detailedAddress"}
            placeholder={t("Address")}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton
          title={isPaying ? t("Processing Payment") : t("Confirm")}
          disabled={isPaying}
          onPress={handleSubmit(saveOrder)}
        />
      </View>
    </AppSafeView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:"column",
    gap: vs(10),
  },
  inputContainer: {
    ...AppStyles.shadow,
    padding: s(8),
    borderRadius: s(8),
    backgroundColor: AppColors.white,
    marginTop: isIOS ? vs(10) : 0,
    paddingVertical: vs(15),
  },
  buttonContainer: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
    position: "absolute",
    bottom: vs(15),
    width: "100%",
  },
  backButton: {
    width: "25%",
    marginTop: vs(5),
    alignSelf: "flex-start",
  },
});
