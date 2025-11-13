import i18next, { type Resource } from "i18next"
import { initReactI18next } from "react-i18next"

import en from "@/locales/en/common.json"
import zh from "@/locales/zh/common.json"
import es from "@/locales/es/common.json"
import hi from "@/locales/hi/common.json"
import fr from "@/locales/fr/common.json"
import de from "@/locales/de/common.json"
import pt from "@/locales/pt/common.json"
import it from "@/locales/it/common.json"

export const supportedLocales = ["en", "zh", "es", "hi", "fr", "de", "pt", "it"] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const localeLabels: Record<SupportedLocale, { label: string; emoji: string }> = {
  en: { label: "English", emoji: "🇺🇸" },
  zh: { label: "中文", emoji: "🇨🇳" },
  es: { label: "Español", emoji: "🇪🇸" },
  hi: { label: "हिंदी", emoji: "🇮🇳" },
  fr: { label: "Français", emoji: "🇫🇷" },
  de: { label: "Deutsch", emoji: "🇩🇪" },
  pt: { label: "Português", emoji: "🇧🇷" },
  it: { label: "Italiano", emoji: "🇮🇹" },
}

const resources: Resource = {
  en: { common: en },
  zh: { common: zh },
  es: { common: es },
  hi: { common: hi },
  fr: { common: fr },
  de: { common: de },
  pt: { common: pt },
  it: { common: it },
}

export function mapNavigatorToSupported(lang: string | undefined): SupportedLocale {
  if (!lang) return "en"
  const base = lang.toLowerCase().split("-")[0]
  if (supportedLocales.includes(base as SupportedLocale)) return base as SupportedLocale
  return "en"
}

export function detectInitialLocale(): SupportedLocale {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("locale") as SupportedLocale | null
    if (saved && supportedLocales.includes(saved)) return saved
    return mapNavigatorToSupported(window.navigator.language)
  }
  return "en"
}

let initialized = false

export function ensureI18n() {
  if (initialized) return i18next
  i18next.use(initReactI18next).init({
    resources,
    lng: detectInitialLocale(),
    fallbackLng: "en",
    supportedLngs: supportedLocales as unknown as string[],
    interpolation: { escapeValue: false },
    defaultNS: "common",
    ns: ["common"],
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  })
  initialized = true
  return i18next
}

export default i18next
