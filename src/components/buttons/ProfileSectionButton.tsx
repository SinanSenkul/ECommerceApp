import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import AppText from '../texts/AppText';
import { AppColors } from '../../styles/colors';
import { s, vs } from "react-native-size-matters";
import { AppFonts } from '../../styles/fonts';
import { MaterialIcons } from '@expo/vector-icons';

interface IProfileSectionButton {
  onPress?: () => void;
  title?: string;
}

const ProfileSectionButton: FC<IProfileSectionButton> = ({
  onPress,
  title,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.titleContainer}>
        <AppText style={styles.title}>{title}</AppText>
      </View>
      <View>
        <MaterialIcons name="arrow-forward" size={s(14)} color={AppColors.black} />
      </View>
    </TouchableOpacity>
  );
  
};

export default ProfileSectionButton

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomColor: AppColors.lightGray,
    paddingBottom: vs(10),
    marginTop: vs(14),
    flexDirection: "row",
    borderBottomWidth: 1.5,
  },
  title: {
    fontSize: s(16),
    fontFamily: AppFonts.Medium,
    color: AppColors.primary,
  },
  titleContainer: {
    flex: 5,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginHorizontal: s(8),
  },
});