"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import i18n, { ensureI18n, detectInitialLocale, type SupportedLocale, supportedLocales, localeLabels } from "@/lib/i18n"

interface LocaleContextType {
  locale: SupportedLocale
  setLocale: (lng: SupportedLocale) => void
  supported: readonly SupportedLocale[]
  labels: typeof localeLabels
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  ensureI18n()
  const [locale, setLocaleState] = useState<SupportedLocale>(detectInitialLocale())
  const [mounted, setMounted] = useState(false)
  useTranslation() // ensures provider subscriptions

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
    try {
      localStorage.setItem("locale", locale)
    } catch {}
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale: (lng: SupportedLocale) => setLocaleState(lng),
      supported: supportedLocales,
      labels: localeLabels,
    }),
    [locale]
  )

  if (!mounted) return null
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
