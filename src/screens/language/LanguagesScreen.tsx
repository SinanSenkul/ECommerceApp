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

const LanguageBottomSheet = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { languageCode, languages } = useSelector(
    (state: RootState) => state.languageSlice,
  );

  const [languageChanged, setLanguageChanged] = useState(false);
  const [lngCode, setLngCode] = useState(languageCode);
  const [lngTitle, setLngTitle] = useState("");

  const handlePress = (title) => {
    let code = "";
    if (title === "English") {
      code = "en";
    } else if (title === "Türkçe") {
      code = "tr";
    } else {
      code = "es";
    }
    console.log("the code is: ", code);
    setLngTitle(title);
    setLanguageChanged(true);
    setLngCode(code);
    dispatch(setLanguageCode(code));
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

  const { t } = useTranslation();

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
              key={lang.title}
              title={lang.title}
              selected={lang.selected}
              onPress={() => handlePress(lang.title)}
            />
          ))}
        </View>
        <AppButton
          title={t("Confirm")}
          onPress={() => {
            handleConfirm();
          }}
        />
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
