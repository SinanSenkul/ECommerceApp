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
  badgeCount?: number;
}

const ProfileSectionButton: FC<IProfileSectionButton> = ({
  onPress,
  title,
  iconName,
  badgeCount = 0,
}) => {
  const { mode } = useSelector((state: RootState) => state.appColor);
  const iconColor =
    mode === "nightMode" ? AppColors.white : AppColors.backgroundBlack;
  const showBadge = badgeCount > 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.titleContainer}>
        <AppText style={styles.title}>{title}</AppText>
      </View>
      {iconName && (
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={s(20)} color={iconColor} />
          {showBadge && (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </AppText>
            </View>
          )}
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
  badge: {
    minWidth: s(16),
    height: s(16),
    borderRadius: s(8),
    paddingHorizontal: s(4),
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: -s(8),
    top: -s(8),
    backgroundColor: AppColors.red,
  },
  badgeText: {
    color: AppColors.white,
    fontFamily: AppFonts.Bold,
    fontSize: s(9),
    lineHeight: s(11),
  },
});
