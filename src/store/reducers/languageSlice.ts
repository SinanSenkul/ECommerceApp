import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18n from "../../localization/i18n";

interface LanguageItem {
  code: string;
  title: string;
  selected: boolean;
}

interface LanguageState {
  languageCode: string;
  languages: LanguageItem[];
}

const state: LanguageState = {
  languageCode: "en",
  languages: [
    { code: "en", title: "English", selected: true },
    { code: "tr", title: "Türkçe", selected: false },
    { code: "es", title: "Español", selected: false },
  ],
};

const languageSlice = createSlice({
  name: "language",
  initialState: state,
  reducers: {
    setLanguageCode: (state, action: PayloadAction<string>) => {
      state.languageCode = action.payload;
      state.languages = state.languages.map((lang) =>
        lang.code === state.languageCode
          ? { ...lang, selected: true }
          : { ...lang, selected: false },
      );
      i18n.changeLanguage(action.payload);
    },
  },
});

export const { setLanguageCode } = languageSlice.actions;
export default languageSlice.reducer;
