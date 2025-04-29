// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLangDir(lang: string): "ltr" | "rtl" {
  return lang === "fa" ? "rtl" : "ltr";
}

export const settings = {
  admin: {
    dashboard: "/admin",
  },
};

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  fa: () => import("../dictionaries/fa.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" | "fa") =>
  dictionaries[locale]();
