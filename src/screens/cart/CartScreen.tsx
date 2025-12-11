import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HomeHeader from '../../components/headers/HomeHeader'
import AppSafeView from '../../components/views/AppSafeView'

const CartScreen = () => {
  return (
    <AppSafeView>
      <HomeHeader/>
    </AppSafeView>
  )
}

export default CartScreen

const styles = StyleSheet.create({})