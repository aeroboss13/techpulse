import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ru';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.bookmarks': 'Bookmarks',
    'nav.snippets': 'My Snippets',
    'nav.aiAssistant': 'AI Assistant',
    'nav.profile': 'Profile',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.logIn': 'Log In',
    'auth.loggingIn': 'Logging in...',
    'auth.fullName': 'Full Name',
    'auth.username': 'Username',
    'auth.confirmPassword': 'Confirm Password',
    'auth.createAccount': 'Create Account',
    'auth.creatingAccount': 'Creating Account...',
    
    // Post actions
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.bookmark': 'Bookmark',
    'post.share': 'Share',
    
    // Code snippets
    'code.save': 'Save',
    'code.copy': 'Copy',
    'code.delete': 'Delete',
    'code.edit': 'Edit',
    'code.language': 'Language',
    'code.title': 'Title',
    'code.description': 'Description',
    'code.public': 'Public',
    'code.private': 'Private',
    
    // Profile
    'profile.posts': 'Posts',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.edit': 'Edit Profile',
    
    // AI Assistant
    'ai.analyzePost': 'Analyze Post',
    'ai.improveCode': 'Improve Code',
    'ai.suggestTopics': 'Suggest Topics',
    'ai.sendMessage': 'Send Message',
    'ai.placeholder': 'Ask me anything about coding or get help with your posts...',
    
    // General
    'general.loading': 'Loading...',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.search': 'Search',
    'general.newPost': 'New Post',
    'general.submit': 'Submit',
    'general.trending': 'Trending',
    'general.suggested': 'Suggested for you',
    'general.seeMore': 'See more',
    'general.settings': 'Settings',
    'general.logout': 'Log out',
    'general.language': 'Language',
    'general.theme': 'Theme',
    'general.lightMode': 'Light mode',
    'general.darkMode': 'Dark mode',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.explore': 'Обзор',
    'nav.bookmarks': 'Закладки',
    'nav.snippets': 'Мои Сниппеты',
    'nav.aiAssistant': 'ИИ-Ассистент',
    'nav.profile': 'Профиль',
    
    // Auth
    'auth.signIn': 'Вход',
    'auth.signUp': 'Регистрация',
    'auth.email': 'Эл. почта',
    'auth.password': 'Пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.logIn': 'Войти',
    'auth.loggingIn': 'Вход...',
    'auth.fullName': 'Полное имя',
    'auth.username': 'Имя пользователя',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.createAccount': 'Создать аккаунт',
    'auth.creatingAccount': 'Создание аккаунта...',
    
    // Post actions
    'post.like': 'Нравится',
    'post.comment': 'Комментарий',
    'post.bookmark': 'Закладка',
    'post.share': 'Поделиться',
    
    // Code snippets
    'code.save': 'Сохранить',
    'code.copy': 'Копировать',
    'code.delete': 'Удалить',
    'code.edit': 'Изменить',
    'code.language': 'Язык',
    'code.title': 'Название',
    'code.description': 'Описание',
    'code.public': 'Публичный',
    'code.private': 'Приватный',
    
    // Profile
    'profile.posts': 'Посты',
    'profile.followers': 'Подписчики',
    'profile.following': 'Подписки',
    'profile.edit': 'Изменить профиль',
    
    // AI Assistant
    'ai.analyzePost': 'Анализировать пост',
    'ai.improveCode': 'Улучшить код',
    'ai.suggestTopics': 'Предложить темы',
    'ai.sendMessage': 'Отправить сообщение',
    'ai.placeholder': 'Спросите что-нибудь о программировании или получите помощь с вашими постами...',
    
    // General
    'general.loading': 'Загрузка...',
    'general.save': 'Сохранить',
    'general.cancel': 'Отмена',
    'general.delete': 'Удалить',
    'general.edit': 'Изменить',
    'general.search': 'Поиск',
    'general.newPost': 'Новый пост',
    'general.submit': 'Отправить',
    'general.trending': 'Популярное',
    'general.suggested': 'Рекомендовано для вас',
    'general.seeMore': 'Показать больше',
    'general.settings': 'Настройки',
    'general.logout': 'Выйти',
    'general.language': 'Язык',
    'general.theme': 'Тема',
    'general.lightMode': 'Светлая тема',
    'general.darkMode': 'Темная тема',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage === 'ru' ? 'ru' : 'en';
  });

  useEffect(() => {
    // Persist the language preference
    localStorage.setItem('language', language);
    // You might also set the html lang attribute here
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}