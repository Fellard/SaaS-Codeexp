
import React from 'react';
import { useTranslation } from '@/i18n/useTranslation.js';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar-MA', label: 'AR' }
  ];

  return (
    <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 backdrop-blur-sm border border-white/10">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
            language === lang.code 
              ? 'bg-accent text-primary shadow-md' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
