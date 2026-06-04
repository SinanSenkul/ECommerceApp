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
import { collection, doc, getDoc, runTransaction } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { showMessage } from "react-native-flash-message";
import { emptyItems } from "../../store/reducers/cartSlice";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createMockPayment,
  createStripePayment,
} from "../../services/paymentService";
import { useStripe } from "@stripe/stripe-react-native";
import { isStripeConfigured, stripeConfig } from "../../config/stripe";

const CheckoutScreen = () => {
  const { t } = useTranslation();
  const [userId, setuserId] = useState(auth.currentUser?.uid ?? "");
  const [isPaying, setIsPaying] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { mode } = useSelector((state: RootState) => state.appColor); // nightmode/daymode
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.backgroundBlack : AppColors.backgroundWhite,
    textColor: isNight ? AppColors.white : AppColors.black,
    inputContainerBG: isNight ? AppColors.inkBlack : AppColors.backgroundWhite,
  };

  const getUserId = async () => {
    let userDataStringified = await AsyncStorage.getItem("user-data");
    if (userDataStringified) {
      let userDataObj = JSON.parse(userDataStringified);
      setuserId(userDataObj.uid);
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

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
      const uid = auth.currentUser?.uid || userId;
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
  }, [reset, user?.email, userId]);

  const saveOrder = async (formData: formData) => {
    function formatToDDMMYYYY(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    }

    try {
      if (!userId) {
        Alert.alert(t("Sign-up failed"), t("User not found"));
        return;
      }

      if (items.length < 1) {
        Alert.alert(t("Order could not be completed"), t("Your Cart is Empty"));
        return;
      }

      setIsPaying(true);

      const payment = isStripeConfigured
        ? await createStripePayment({
            amount: priceSum,
            currency: "TRY",
            itemIds: items.map((item) => item.id),
            userId,
            fullName: formData.fullName,
            emailAddress: formData.emailAddress,
            endpoint: stripeConfig.paymentSheetEndpoint,
            merchantDisplayName: stripeConfig.merchantDisplayName,
            initPaymentSheet,
            presentPaymentSheet,
          })
        : await createMockPayment({
            amount: priceSum,
            currency: "TRY",
            itemCount: items.length,
            userId,
          });

      const orderBody = {
        ...formData,
        items,
        priceSum,
        payment,
        paymentStatus: "paid",
        createDate: formatToDDMMYYYY(new Date()),
      };
      const userOrderRef = doc(collection(doc(db, "users", userId), "orders"));
      const orderRef = doc(collection(db, "orders"));

      await runTransaction(db, async (transaction) => {
        const productRefs = items.map((item) =>
          doc(db, "products_onsale", String(item.id)),
        );
        const productSnapshots = await Promise.all(
          productRefs.map((productRef) => transaction.get(productRef)),
        );

        productSnapshots.forEach((productSnapshot, index) => {
          const productData = productSnapshot.data();
          const currentStock = productData?.stockQuantity;
          if (typeof currentStock !== "number") {
            return;
          }

          if (currentStock < 1) {
            throw new Error("Product is out of stock");
          }

          transaction.update(productRefs[index], {
            stockQuantity: currentStock - 1,
          });
        });

        transaction.set(userOrderRef, orderBody);
        transaction.set(orderRef, orderBody);
      });

      dispatch(emptyItems());
      navigation.goBack();
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
