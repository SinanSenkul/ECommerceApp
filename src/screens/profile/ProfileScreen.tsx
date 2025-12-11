import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HomeHeader from '../../components/headers/HomeHeader'
import AppSafeView from '../../components/views/AppSafeView';

const ProfileScreen = () => {
  return (
    <AppSafeView>
      <HomeHeader />
    </AppSafeView>
  );
}

export default ProfileScreen

const styles = StyleSheet.create({})