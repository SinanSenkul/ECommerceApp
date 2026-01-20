import { Alert, StyleSheet, Text, View } from "react-native";
import React from "react";
import AppSafeView from "../../components/views/AppSafeView";
import { AppStyles, sharedStyles } from "../../styles/sharedStyles";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import AppTextInput from "../../components/inputs/AppTextInput";
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
import { addDoc, collection, doc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { showMessage } from "react-native-flash-message";
import { emptyItems } from "../../store/reducers/cartSlice";

const schema = yup
  .object({
    fullName: yup.string().required("Name is required!"),
    emailAddress: yup
      .string()
      .email("This is not a valid email!")
      .required("Email is required!")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format",
      ),
    detailedAddress: yup
      .string()
      .min(5, "Address too short!")
      .required("Detailed address is required!"),
  })
  .required();

type formData = yup.InferType<typeof schema>;

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.userSlice);
  const { items } = useSelector((state: RootState) => state.cartSlice);
  const user = auth.currentUser;

  const priceSum =
    items.reduce((acc, item) => acc + item.price * item.qty, 0) + fee + tax;

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const saveOrder = async (formData) => {
    function formatToDDMMYYYY(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    }

    try {
      const orderBody = {
        ...formData,
        items,
        priceSum,
        createDate: formatToDDMMYYYY(new Date()),
      };
      const userOrderRef = collection(doc(db, "users", userData.uid), "orders");
      await addDoc(userOrderRef, orderBody);

      const ordersRef = collection(db, "orders");
      await addDoc(ordersRef, orderBody);

      dispatch(emptyItems())
      navigation.goBack();
      showMessage({
        message: "Orders saved successfully",
        type: "success",
        duration: 1000,
        floating: true,
        icon: "success",
        position: "top",
      });
    } catch (error) {
      console.error("Error saving order ", error);
    }
  };

  // when text is written it'll be changed in global and if user goes back and again comes to checkout his information will be there
  return (
    <AppSafeView style={{ flex: 1 }}>
      <HomeHeader />
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <AppButton
          title="Back"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.inputContainer}>
          <AppTextInputController
            control={control}
            name={"fullName"}
            placeholder="Username"
            value={user?.email?.split("@")[0]}
          />
          <AppTextInputController
            control={control}
            name={"emailAddress"}
            placeholder="Email Address"
            value={user?.email}
          />
          <AppTextInputController
            control={control}
            name={"detailedAddress"}
            placeholder="Address"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <AppButton title="Confirm" onPress={handleSubmit(saveOrder)} />
      </View>
    </AppSafeView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
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
    bottom: vs(3),
    width: "100%",
  },
  backButton: {
    width: "25%",
    marginTop: vs(5),
    alignSelf: "flex-start",
  },
});
