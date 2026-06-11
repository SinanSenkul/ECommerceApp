import i18n from "i18next";
import { initReactI18next } from "react-i18next"; //integration library, between i18next and react
import en from "./en.json";
import tr from "./tr.json";
import es from "./es.json";
import de from "./de.json";
import it from "./it.json";
import fr from "./fr.json";
import ru from "./ru.json";
import pt from "./pt.json";

const LANGUAGES = {
  en: { translation: en },
  tr: { translation: tr },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  fr: { translation: fr },
  ru: { translation: ru },
  pt: { translation: pt },
};

// const getDeviceLanguage = () => {

// };

i18n.use(initReactI18next).init({
  resources: LANGUAGES,
  fallbackLng: "en",
  defaultNS: "translation", //NS: name space
  ns: ["translation"],
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
