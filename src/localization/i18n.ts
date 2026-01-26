import i18n from "i18next";
import { initReactI18next } from "react-i18next"; //integration library, between i18next and react
import en from "./en.json";
import tr from "./tr.json";
import es from "./es.json";

const LANGUAGES = {
  en: { translation: en },
  tr: { translation: tr },
  es: { translation: es },
};

// const getDeviceLanguage = () => {
  
// };

i18n.use(initReactI18next).init({
  resources: LANGUAGES,
  // lng: getDeviceLanguage(),
  fallbackLng: "en",
  dafaultNS: "translation", //NS: name space
  ns: ["translation"],
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
