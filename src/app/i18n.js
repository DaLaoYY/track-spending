import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { cn } from "./lib/utils";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: "Welcome",
        signOut: "Sign Out",
        update: "Update",
        delete: "Delete",
        food: "Food & Dining",
        transport: "Transportation",
        shopping: "Shopping",
        utilities: "Utilities",
        other: "Other",
        addExpense: "Add Expense",
        summary: "Summary",
        input: "Input",
      },
    },
    cn: {
      translation: {
        welcome: "Bienvenido",
        signOut: "登出",
        update: "更新",
        delete: "删除",
        food: "餐饮",
        transport: "交通",
        shopping: "购物",
        utilities: "日用",
        other: "其他",
        addExpense: "记账",
        summary: "明细",
        input: "记账",
        // add more translations for Spanish
      },
    },
  },
  lng: "cn", // default language
  fallbackLng: "cn", // fallback language
  interpolation: {
    escapeValue: false, // react already escapes
  },
});

export default i18n;
