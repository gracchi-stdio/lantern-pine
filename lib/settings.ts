import { TZDate } from "react-day-picker";

export type Locale = "fa" | "en";
export const LOCALES = ["fa", "en"];
export const DEFAULT_LOCALE = "fa";
import timezones from "@/timezones.json";
export { timezones };
// use the default timezone for the application
export const DEFAULT_TIMEZONE = "America/Vancouver";

export const localDate = TZDate.tz(DEFAULT_TIMEZONE);
