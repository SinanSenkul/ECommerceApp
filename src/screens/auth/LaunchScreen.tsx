import { StyleSheet, ActivityIndicator, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "../../constants/image-paths";
import { s, vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppColors } from "../../styles/colors";
import { useDispatch } from "react-redux";
import { setUserData } from "../../store/reducers/userSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../config/firebase";

const LaunchScreen = () => {
  const navigation = useNavigation();
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const dispatch = useDispatch();

  const isLoggedInLocally = async () => { // this func is just for educational purposes. in real-time app uses firebase for this purpose
    let status = await AsyncStorage.getItem("logged-in");
    if (status === "true") {
      setUserLoggedIn(true);
    } else {
      setUserLoggedIn(false);
    }
  };

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const setData = async () => {
    //global userData updated with local userData
    const userDataStr = await AsyncStorage.getItem("user-data");
    if (userDataStr) {
      const userDataObj = JSON.parse(userDataStr);
      dispatch(setUserData(userDataObj)); //test if necessary
    }
  };

  useEffect(() => {
    const isLoggedIn = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setData();
        navigation.navigate("MainAppBottomTabs");
      } else {
        navigation.navigate("AuthStack");
      }
    });
    return () => isLoggedIn();
  }, []);

  return (
    <View style={styles.userLoggedIn}>
      <ActivityIndicator size="large" color={AppColors.white} />
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  userLoggedIn: {
    flex: 1,
    backgroundColor: AppColors.black,
    alignItems: "center",
    justifyContent: "center",
  },
});
