// lib/utils.ts
import { env } from "@/env.mjs";
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
    githubUsers: ["gracchi-stdio"],
  },
  logoutRedirect: "/",
  contentRepo: "gracchi-stdio/lantern-pine-content",

  domain: {
    prod: "lanternandpine.com",
    dev: "localhost:3000",
    getCurrent: () =>
      env.NODE_ENV === "production"
        ? settings.domain.prod
        : settings.domain.dev,
  },
};

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  fa: () => import("../dictionaries/fa.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" | "fa") =>
  dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export const getLocalizedField = <T extends Record<string, unknown>>(
  obj: T | undefined,
  field: string,
  lang: string,
) => {
  if (!obj) return null;

  const localizedField =
    `${field}${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof T;
  return obj?.[localizedField] as T[keyof T];
};
