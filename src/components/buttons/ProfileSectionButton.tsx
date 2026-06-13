import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { FC } from "react";
import AppText from "../texts/AppText";
import { AppColors } from "../../styles/colors";
import { s, vs } from "react-native-size-matters";
import { AppFonts } from "../../styles/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface IProfileSectionButton {
  onPress?: () => void;
  title?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const ProfileSectionButton: FC<IProfileSectionButton> = ({
  onPress,
  title,
  iconName,
}) => {
  const { mode } = useSelector((state: RootState) => state.appColor);
  const iconColor =
    mode === "nightMode" ? AppColors.white : AppColors.backgroundBlack;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.titleContainer}>
        <AppText style={styles.title}>{title}</AppText>
      </View>
      {iconName && (
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={s(20)} color={iconColor} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProfileSectionButton;

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
  iconContainer: {
    width: s(24),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: s(8),
  },
});
