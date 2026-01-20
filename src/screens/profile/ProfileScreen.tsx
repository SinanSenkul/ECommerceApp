import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import HomeHeader from "../../components/headers/HomeHeader";
import AppSafeView from "../../components/views/AppSafeView";
import ProfileSectionButton from "../../components/buttons/ProfileSectionButton";
import { sharedStyles } from "../../styles/sharedStyles";
import AppText from "../../components/texts/AppText";
import { s, vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../../components/buttons/AppButton";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { auth } from "../../config/firebase";

interface IProfileScreen {
  username?: string;
}

const ProfileScreen: FC<IProfileScreen> = ({ username = "default" }) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state: RootState) => state.userSlice);

  const user = auth.currentUser;

  return (
    <AppSafeView>
      <HomeHeader />
      <AppText
        variant="bold"
        style={{ fontSize: s(18), marginTop: vs(10), marginLeft: s(5) }}
      >
        Hello, {user?.email?.split("@")[0]}
      </AppText>
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <ProfileSectionButton
          title="My Orders"
          onPress={() => navigation.navigate("MyOrdersScreen")}
        />
        <ProfileSectionButton title="Language" />
        <ProfileSectionButton
          title="Log Out"
          onPress={() => navigation.navigate("AuthStack")}
        />
      </View>
      <AppButton
        title="Back"
        style={{ marginTop: vs(5) }}
        onPress={() => navigation.goBack()}
      />
    </AppSafeView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
