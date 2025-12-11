import { Button, Text } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import AppSafeView from '../../components/views/AppSafeView';
import HomeHeader from '../../components/headers/HomeHeader';
import { AppFonts } from '../../styles/fonts';
import ProductCard from '../../components/cards/ProductCard';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <AppSafeView>
      <HomeHeader />
      <ProductCard/>
      
    </AppSafeView>
  );
}

export default HomeScreen