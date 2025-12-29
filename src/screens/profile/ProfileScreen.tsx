import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import HomeHeader from '../../components/headers/HomeHeader'
import AppSafeView from '../../components/views/AppSafeView';
import ProfileSectionButton from '../../components/buttons/ProfileSectionButton';
import { sharedStyles } from '../../styles/sharedStyles';
import AppText from '../../components/texts/AppText';
import { s,vs } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/buttons/AppButton';

interface IProfileScreen{
  username?: string
}

const ProfileScreen: FC<IProfileScreen> = ({ username = "sinan" }) => {
  const navigation = useNavigation();
  return (
    <AppSafeView>
      <HomeHeader />
      <AppText
        variant="bold"
        style={{ fontSize: s(18), marginTop: vs(10), marginLeft: s(5) }}
      >
        Hello, {username}
      </AppText>
      <View style={{ paddingHorizontal: sharedStyles.paddingHorizontal }}>
        <ProfileSectionButton
          title="My Orders"
          onPress={() => navigation.navigate("MyOrdersScreen")}
        />
        <ProfileSectionButton title="Language" />
        <ProfileSectionButton title="Log Out" />
      </View>
      <AppButton title="Back" style={{marginTop: vs(5)}} onPress={()=>navigation.navigate("MainAppBottomTabs")} />
    </AppSafeView>
  );
};

export default ProfileScreen

const styles = StyleSheet.create({})