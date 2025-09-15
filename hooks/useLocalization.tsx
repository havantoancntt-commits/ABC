import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { translations } from '../locales/translations';

export type Language = 'vi' | 'en';
export type TranslationKey = keyof typeof translations.vi & keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('language');
        if (storedLang === 'en' || storedLang === 'vi') {
            return storedLang;
        }
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en') {
            return 'en';
        }
    }
    return 'vi';
};

export const defaultLanguageContext: LanguageContextType = {
    language: 'vi',
    setLanguage: () => {},
    t: (key: TranslationKey) => key,
};

export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: TranslationKey, params: Record<string, string | number> = {}) => {
    let text = translations[language][key] || translations['vi'][key] || key;
    
    for (const paramKey in params) {
        const regex = new RegExp(`{{${paramKey}}}`, 'g');
        text = text.replace(regex, String(params[paramKey]));
    }

    return text;
  }, [language]);

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLocalization = (): LanguageContextType => {
  return useContext(LanguageContext);
};