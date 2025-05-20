import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.profile': 'Profile',
    'nav.snippets': 'Code Snippets',
    'nav.ai': 'AI Assistant',
    'nav.bookmarks': 'Bookmarks',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.login': 'Login',
    'auth.register': 'Register',
    
    // Posts
    'post.write': 'What\'s on your mind?',
    'post.addCode': 'Add Code',
    'post.post': 'Post',
    'post.like': 'Like',
    
    // General
    'general.search': 'Search',
    'general.darkMode': 'Dark Mode',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.explore': 'Обзор',
    'nav.profile': 'Профиль',
    'nav.snippets': 'Сниппеты кода',
    'nav.ai': 'ИИ-ассистент',
    'nav.bookmarks': 'Закладки',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выйти',
    'nav.login': 'Войти',
    
    // Auth
    'auth.email': 'Эл. почта',
    'auth.password': 'Пароль',
    'auth.username': 'Имя пользователя',
    'auth.login': 'Войти',
    'auth.register': 'Регистрация',
    
    // Posts
    'post.write': 'О чем вы думаете?',
    'post.addCode': 'Добавить код',
    'post.post': 'Опубликовать',
    'post.like': 'Нравится',
    
    // General
    'general.search': 'Поиск',
    'general.darkMode': 'Темная тема',
  }
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get the language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      return savedLanguage === 'ru' ? 'ru' : 'en';
    }
    return 'en';
  });

  useEffect(() => {
    // Persist the language preference
    localStorage.setItem('language', language);
    // Set the html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}