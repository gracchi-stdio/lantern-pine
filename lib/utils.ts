// lib/utils.ts
export function getLangDir(lang: string): "ltr" | "rtl" {
  return lang === "fa" ? "rtl" : "ltr";
}

export const settings = {
  admin: {
    dashboard: "/admin",
  },
};
