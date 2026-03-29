import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { AppLanguage, Translations } from './types'
import { pl } from './pl'

export type { AppLanguage } from './types'

const STORAGE_KEY = 'duty-planner:v1:language'

const TRANSLATIONS: Record<AppLanguage, Translations> = {
  pl,
}

export const LOCALE_MAP: Record<AppLanguage, string> = {
  pl: 'pl-PL',
}

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  pl: 'Polski',
}

function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'pl') return stored
  } catch {
    // ignore storage errors
  }
  return 'pl'
}

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
  t: Translations
  locale: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(readStoredLanguage)

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore storage errors
    }
  }, [])

  const t = TRANSLATIONS[language] ?? pl
  const locale = LOCALE_MAP[language] ?? 'pl-PL'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used inside LanguageProvider')
  return ctx
}
