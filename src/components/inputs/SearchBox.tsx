import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";
import { AppColors } from "../../styles/colors";

interface SearchBoxProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBox = ({ value, onChangeText }: SearchBoxProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={s(20)}
          color={AppColors.medGray}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholder="Search"
          placeholderTextColor={AppColors.medGray}
          returnKeyType="search"
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchBox;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: vs(10),
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderColor: AppColors.borderColor,
    borderRadius: s(25),
    borderWidth: s(1),
    flexDirection: "row",
    height: vs(40),
    paddingHorizontal: s(14),
    width: "80%",
  },
  input: {
    flex: 1,
    fontSize: s(16),
    marginLeft: s(8),
    paddingVertical: 0,
  },
});
