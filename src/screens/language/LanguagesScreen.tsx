import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { s, vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setLanguageCode } from "../../store/reducers/languageSlice";
import { AppFonts } from "../../styles/fonts";
import { showMessage } from "react-native-flash-message";
import AppSafeView from "../../components/views/AppSafeView";
import AppText from "../../components/texts/AppText";
import Radio from "../../components/inputs/Radio";
import AppButton from "../../components/buttons/AppButton";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageBottomSheet = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { languages } = useSelector(
    (state: RootState) => state.languageSlice,
  );

  const [languageChanged, setLanguageChanged] = useState(false);
  const [lngTitle, setLngTitle] = useState("");
  const { t, i18n } = useTranslation();

  const handlePress = (code: string, title: string) => {
    setLngTitle(title);
    setLanguageChanged(true);
    dispatch(setLanguageCode(code));
    storeLangCode(code);
  };

  const handleConfirm = () => {
    navigation.goBack();
    languageChanged &&
      showMessage({
        message: t("common.messages.langChanged", {
          language: lngTitle,
        }),
        type: "success",
        duration: 1000,
        floating: true,
        icon: "success",
        position: "top",
      });
  };

  const storeLangCode = async (code: string) => {
    try {
      await AsyncStorage.setItem("lang-code", code);
    } catch (e) {
      console.error("saving error: ", e);
    }
  };

  return (
    <AppSafeView>
      <View style={styles.container}>
        <AppText
          style={{
            textAlign: "center",
            fontFamily: AppFonts.Bold,
          }}
        >
          {t("Change Language")}
        </AppText>
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <Radio
              key={lang.code}
              title={lang.title}
              selected={lang.code === i18n.language}
              onPress={() => handlePress(lang.code, lang.title)}
            />
          ))}
        </View>
        <AppButton title={t("Done")} onPress={handleConfirm} />
      </View>
    </AppSafeView>
  );
};

export default LanguageBottomSheet;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginTop: vs(5),
    padding: s(40),
  },
  languageList: {
    marginBottom: vs(20),
  },
});
