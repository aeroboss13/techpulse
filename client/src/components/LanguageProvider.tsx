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
    'auth.signIn': 'Log In',
    'auth.signUp': 'Sign Up',
    'auth.forgotPassword': 'Forgot password?',
    'auth.fullName': 'Full Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.createAccount': 'Create Account',
    'auth.creatingAccount': 'Creating Account...',
    'auth.loggingIn': 'Logging in...',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.enterName': 'Enter your name',
    'auth.chooseUsername': 'Choose a username',
    'auth.createPassword': 'Create a password',
    'auth.confirmYourPassword': 'Confirm your password',
    
    // Posts
    'post.write': 'What\'s on your mind?',
    'post.addCode': 'Add Code',
    'post.post': 'Post',
    'post.like': 'Like',
    
    // Profile
    'profile.edit': 'Edit Profile',
    'profile.editDescription': 'Update your profile information',
    'profile.defaultBio': 'Full-stack developer passionate about creating intuitive user experiences and scalable backends.',
    'profile.displayName': 'Display Name',
    'profile.username': 'Username',
    'profile.bio': 'Bio',
    'profile.location': 'Location',
    'profile.website': 'Website',
    'profile.github': 'GitHub Username',
    'profile.twitter': 'Twitter Username',
    'profile.joined': 'Joined',
    'profile.posts': 'Posts',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.avatarDescription': 'Your profile picture is visible to all users',
    'profile.updateSuccess': 'Profile Updated',
    'profile.updateSuccessMessage': 'Your profile has been updated successfully',
    'profile.updateError': 'Update Failed',
    'profile.noPosts': 'No posts yet',
    'profile.noPostsMessage': 'Share your first post with the community!',
    'profile.noSnippets': 'No code snippets yet',
    'profile.noSnippetsMessage': 'Share your first code snippet with the community!',
    'profile.noLikes': 'No liked posts yet',
    'profile.noLikesMessage': 'Like posts to see them here!',
    
    // General
    'general.search': 'Search',
    'general.darkMode': 'Dark Mode',
    'general.loading': 'Loading...',
    'general.save': 'Save',
    'general.saving': 'Saving...',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
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
    'auth.signIn': 'Вход',
    'auth.signUp': 'Регистрация',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.fullName': 'Полное имя',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.createAccount': 'Создать аккаунт',
    'auth.creatingAccount': 'Создание аккаунта...',
    'auth.loggingIn': 'Вход в систему...',
    'auth.enterEmail': 'Введите email',
    'auth.enterPassword': 'Введите пароль',
    'auth.enterName': 'Введите ваше имя',
    'auth.chooseUsername': 'Выберите имя пользователя',
    'auth.createPassword': 'Создайте пароль',
    'auth.confirmYourPassword': 'Подтвердите ваш пароль',
    
    // Posts
    'post.write': 'О чем вы думаете?',
    'post.addCode': 'Добавить код',
    'post.post': 'Опубликовать',
    'post.like': 'Нравится',
    
    // Profile
    'profile.edit': 'Редактировать профиль',
    'profile.editDescription': 'Обновите информацию о себе',
    'profile.defaultBio': 'Full-stack разработчик, увлеченный созданием интуитивно понятных пользовательских интерфейсов и масштабируемых бэкендов.',
    'profile.displayName': 'Отображаемое имя',
    'profile.username': 'Имя пользователя',
    'profile.bio': 'О себе',
    'profile.location': 'Местоположение',
    'profile.website': 'Веб-сайт',
    'profile.github': 'Имя на GitHub',
    'profile.twitter': 'Имя в Twitter',
    'profile.joined': 'Присоединился',
    'profile.posts': 'Посты',
    'profile.followers': 'Подписчики',
    'profile.following': 'Подписки',
    'profile.avatarDescription': 'Ваша аватарка видна всем пользователям',
    'profile.updateSuccess': 'Профиль обновлен',
    'profile.updateSuccessMessage': 'Ваш профиль был успешно обновлен',
    'profile.updateError': 'Ошибка обновления',
    'profile.noPosts': 'Нет постов',
    'profile.noPostsMessage': 'Поделитесь своим первым постом с сообществом!',
    'profile.noSnippets': 'Нет сниппетов кода',
    'profile.noSnippetsMessage': 'Поделитесь своим первым сниппетом кода с сообществом!',
    'profile.noLikes': 'Нет понравившихся постов',
    'profile.noLikesMessage': 'Отмечайте посты как понравившиеся, чтобы видеть их здесь!',
    
    // General
    'general.search': 'Поиск',
    'general.darkMode': 'Темная тема',
    'general.loading': 'Загрузка...',
    'general.save': 'Сохранить',
    'general.saving': 'Сохранение...',
    'general.cancel': 'Отмена',
    'general.delete': 'Удалить',
    'general.edit': 'Редактировать',
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