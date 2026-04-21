
import React, { createContext, useState, useEffect } from 'react';
import { translations, defaultLanguage } from '@/i18n/i18nConfig';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar-MA' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations[defaultLanguage]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
