import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LocaleContextType {
  locale: 'en' | 'bn';
  setLocale: (lang: 'en' | 'bn') => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('nutrilens_lang') as 'en' | 'bn') || 'en';
  });

  const setLocale = (lang: 'en' | 'bn') => {
    setLocaleState(lang);
    localStorage.setItem('nutrilens_lang', lang);
    i18n.changeLanguage(lang);
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'bn' : 'en';
    setLocale(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
