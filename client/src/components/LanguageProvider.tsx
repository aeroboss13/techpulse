import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Создаем словарь переводов в виде единого объекта для более быстрого доступа
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
    'nav.aiAssistant': 'AI Assistant',
    'nav.search': 'Search DevStream...',
    
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
    'auth.logIn': 'Log In',
    
    // Posts
    'post.write': 'What\'s on your mind?',
    'post.addCode': 'Add Code',
    'post.post': 'Post',
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.bookmark': 'Bookmark',
    'post.share': 'Share',
    
    // AI Assistant
    'ai.send': 'Send',
    'ai.message': 'Type your message',
    'ai.analyze': 'Analyze',
    'ai.analyzePost': 'Analyze Post',
    'ai.improveCode': 'Improve Code',
    'ai.suggestTopics': 'Suggest Topics',
    'ai.sendMessage': 'Send Message',
    'ai.placeholder': 'Ask me anything about coding or get help with your posts...',
    
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
    'general.trendingTech': 'Trending in Tech',
    'general.trendingIn': 'Trending in',
    'general.posts': 'posts',
    'general.follow': 'Follow',
    'general.showMore': 'Show more',
    'general.whoToFollow': 'Who to Follow',
    'general.newPost': 'New Post',
    'general.submit': 'Submit',
    'general.trending': 'Trending',
    'general.latest': 'Latest',
    'general.suggested': 'Suggested for you',
    'general.timeAgo': 'ago',
    'general.minuteAgo': 'minute ago',
    'general.minutesAgo': 'minutes ago',
    'general.hourAgo': 'hour ago',
    'general.hoursAgo': 'hours ago',
    'general.dayAgo': 'day ago',
    'general.daysAgo': 'days ago',
    'general.seeMore': 'See more',
    'general.settings': 'Settings',
    'general.logout': 'Log out',
    'general.language': 'Language',
    'general.theme': 'Theme',
    'general.lightMode': 'Light mode',
    'general.noPosts': 'No posts yet',
    'general.noPostsMessage': 'Be the first to share something with the community!',
    'general.loadError': 'Failed to load posts. Please try again later.',
    'general.tryNow': 'Try It Now',
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
    'nav.aiAssistant': 'ИИ-Ассистент',
    'nav.search': 'Поиск в DevStream...',
    
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
    'auth.logIn': 'Войти',
    
    // Posts
    'post.write': 'О чем вы думаете?',
    'post.addCode': 'Добавить код',
    'post.post': 'Опубликовать',
    'post.like': 'Нравится',
    'post.comment': 'Комментарий',
    'post.bookmark': 'Закладка',
    'post.share': 'Поделиться',
    
    // AI Assistant
    'ai.send': 'Отправить',
    'ai.message': 'Введите сообщение',
    'ai.analyze': 'Анализировать',
    'ai.analyzePost': 'Анализировать пост',
    'ai.improveCode': 'Улучшить код',
    'ai.suggestTopics': 'Предложить темы',
    'ai.sendMessage': 'Отправить сообщение',
    'ai.placeholder': 'Спросите что-нибудь о программировании или получите помощь с вашими постами...',
    
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
    'general.trendingTech': 'Популярно в IT',
    'general.trendingIn': 'Популярно в',
    'general.posts': 'постов',
    'general.follow': 'Подписаться',
    'general.showMore': 'Показать больше',
    'general.whoToFollow': 'Кого читать',
    'general.newPost': 'Новый пост',
    'general.submit': 'Отправить',
    'general.trending': 'Популярное',
    'general.latest': 'Новое',
    'general.suggested': 'Рекомендовано для вас',
    'general.timeAgo': 'назад',
    'general.minuteAgo': 'минуту назад',
    'general.minutesAgo': 'минут назад',
    'general.hourAgo': 'час назад',
    'general.hoursAgo': 'часов назад',
    'general.dayAgo': 'день назад',
    'general.daysAgo': 'дней назад',
    'general.seeMore': 'Показать больше',
    'general.settings': 'Настройки',
    'general.logout': 'Выйти',
    'general.language': 'Язык',
    'general.theme': 'Тема',
    'general.lightMode': 'Светлая тема',
    'general.noPosts': 'Пока нет постов',
    'general.noPostsMessage': 'Будьте первым, кто поделится чем-то с сообществом!',
    'general.loadError': 'Не удалось загрузить посты. Пожалуйста, повторите попытку позже.',
    'general.tryNow': 'Попробовать сейчас',
  }
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Инициализируем состояние языка из localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      return savedLanguage === 'ru' ? 'ru' : 'en';
    }
    return 'en';
  });

  // Эффект для сохранения выбранного языка
  useEffect(() => {
    // Сохраняем в localStorage
    localStorage.setItem('language', language);
    // Устанавливаем атрибут lang для HTML документа
    document.documentElement.lang = language;
    
    // Устанавливаем data-атрибут для возможности стилизации через CSS
    document.documentElement.setAttribute('data-language', language);
    
    // Принудительно вызываем обновление интерфейса
    window.dispatchEvent(new Event('language-changed'));
    
    console.log(`Language changed to: ${language}`);
  }, [language]);

  // Используем useCallback для предотвращения создания новой функции при каждом рендере
  const setLanguage = useCallback((newLanguage: Language) => {
    console.log(`Setting language to: ${newLanguage}`);
    setLanguageState(newLanguage);
  }, []);

  // Мемоизируем функцию перевода для оптимизации
  const t = useCallback((key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  }, [language]);

  // Создаем объект контекста с мемоизированными значениями
  const contextValue = React.useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Кастомный хук для доступа к контексту
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}