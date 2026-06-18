'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

type Language = 'vi' | 'en';
type Translations = typeof vi;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    // Try to load from localStorage on mount
    const saved = localStorage.getItem('language') as Language;
    if (saved === 'vi' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const getNestedTranslation = (obj: any, path: string): string => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj) as string || path;
  };

  const t = (key: string): string => {
    const dictionary = language === 'en' ? en : vi;
    return getNestedTranslation(dictionary, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
