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
    
    // AI Assistant
    'ai.title': 'AI Assistant',
    'ai.description': 'Your AI assistant for coding help and content analysis',
    'ai.askQuestion': 'Ask a Question',
    'ai.contentAnalysis': 'Content Analysis',
    'ai.debugCode': 'Debug My Code',
    'ai.explainConcept': 'Explain a Concept', 
    'ai.generateCode': 'Generate Code',
    'ai.optimizeSolution': 'Optimize Solution',
    'ai.debugDescription': 'Help me find issues in my code',
    'ai.explainDescription': 'Get explanations for technical topics',
    'ai.generateDescription': 'Get code for a specific task',
    'ai.optimizeDescription': 'Make your code more efficient',
    'ai.easyRead': 'Easy to read',
    'ai.moderateComplex': 'Moderately complex',
    'ai.complex': 'Complex',
    'ai.unknown': 'Unknown',
    
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
    'profile.changeAvatar': 'Change Avatar',
    'profile.generating': 'Generating...',
    'profile.male': 'Male',
    'profile.female': 'Female',
    'profile.avatarGenerated': 'Avatar Updated',
    'profile.avatarGeneratedMessage': 'Your new avatar has been successfully generated',
    'profile.avatarError': 'Avatar Generation Failed',
    'profile.updateSuccess': 'Profile Updated',
    'profile.updateSuccessMessage': 'Your profile has been updated successfully',
    'profile.updateError': 'Update Failed',
    
    // Toast notifications
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
    'toast.info': 'Info',
    'toast.copied': 'Copied to clipboard',
    'toast.copyError': 'Failed to copy',
    'toast.postCreated': 'Post created successfully',
    'toast.postCreateError': 'Failed to create post',
    'toast.postLiked': 'Post liked',
    'toast.postUnliked': 'Post unliked',
    'toast.postBookmarked': 'Post bookmarked',
    'toast.postUnbookmarked': 'Post unbookmarked',
    'toast.jobCreated': 'Job posting created successfully',
    'toast.jobCreateError': 'Failed to create job posting',
    'toast.jobUpdated': 'Job posting updated successfully',
    'toast.jobUpdateError': 'Failed to update job posting',
    'toast.jobDeleted': 'Job posting deleted successfully',
    'toast.jobDeleteError': 'Failed to delete job posting',
    'toast.applicationSent': 'Application sent successfully',
    'toast.applicationError': 'Failed to send application',
    'toast.offerSent': 'Job offer sent successfully',
    'toast.offerError': 'Failed to send job offer',
    'toast.resumeCreated': 'Resume created successfully',
    'toast.resumeCreateError': 'Failed to create resume',
    'toast.resumeUpdated': 'Resume updated successfully',
    'toast.resumeUpdateError': 'Failed to update resume',
    'toast.resumeDeleted': 'Resume deleted successfully',
    'toast.resumeDeleteError': 'Failed to delete resume',
    'toast.snippetCreated': 'Code snippet created successfully',
    'toast.snippetCreateError': 'Failed to create code snippet',
    'toast.snippetUpdated': 'Code snippet updated successfully',
    'toast.snippetUpdateError': 'Failed to update code snippet',
    'toast.snippetDeleted': 'Code snippet deleted successfully',
    'toast.snippetDeleteError': 'Failed to delete code snippet',
    'toast.userFollowed': 'User followed successfully',
    'toast.userUnfollowed': 'User unfollowed successfully',
    'toast.followError': 'Failed to follow user',
    'toast.languageChanged': 'Language changed to English',
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
    
    // Profile
    'profile.notFound': 'User Not Found',
    'profile.userNotExists': 'This user does not exist.',
    'profile.editProfile': 'Edit Profile',
    'profile.joinedDate': 'Joined {date}',
    'profile.followers': 'followers',
    'profile.following': 'following',
    'profile.posts': 'Posts',
    'profile.likes': 'Likes',
    'profile.codeSnippets': 'Code Snippets',
    'profile.noPosts': 'No posts yet',
    'profile.noPostsOwn': 'You haven\'t posted anything yet. Share your first post!',
    'profile.noPostsUser': 'This user hasn\'t posted anything yet.',
    'profile.noLikes': 'No likes yet',
    'profile.noLikesDesc': 'Posts liked by this user will appear here.',
    'profile.noSnippets': 'No code snippets',
    'profile.noSnippetsDesc': 'Code snippets shared by this user will appear here.',
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
    
    // AI Assistant
    'ai.title': 'ИИ-Ассистент',
    'ai.description': 'Ваш ИИ-помощник для программирования и анализа контента',
    'ai.askQuestion': 'Задать вопрос',
    'ai.contentAnalysis': 'Анализ контента',
    'ai.debugCode': 'Отладка кода',
    'ai.explainConcept': 'Объяснение концепций',
    'ai.generateCode': 'Генерация кода',
    'ai.optimizeSolution': 'Оптимизация решений',
    'ai.debugDescription': 'Помощь в поиске проблем в коде',
    'ai.explainDescription': 'Получите объяснения технических тем',
    'ai.generateDescription': 'Получите код для конкретной задачи',
    'ai.optimizeDescription': 'Сделайте ваш код более эффективным',
    'ai.easyRead': 'Легко читается',
    'ai.moderateComplex': 'Средней сложности',
    'ai.complex': 'Сложный',
    'ai.unknown': 'Неизвестно',
    
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
    'profile.changeAvatar': 'Изменить аватар',
    'profile.generating': 'Генерация...',
    'profile.male': 'Мужской',
    'profile.female': 'Женский',
    'profile.avatarGenerated': 'Аватар обновлен',
    'profile.avatarGeneratedMessage': 'Ваш новый аватар был успешно сгенерирован',
    'profile.avatarError': 'Ошибка генерации аватара',
    'profile.updateSuccess': 'Профиль обновлен',
    'profile.updateSuccessMessage': 'Ваш профиль был успешно обновлен',
    'profile.updateError': 'Ошибка обновления',
    
    // Toast notifications
    'toast.success': 'Успешно',
    'toast.error': 'Ошибка',
    'toast.warning': 'Предупреждение',
    'toast.info': 'Информация',
    'toast.copied': 'Скопировано в буфер обмена',
    'toast.copyError': 'Не удалось скопировать',
    'toast.postCreated': 'Пост успешно создан',
    'toast.postCreateError': 'Не удалось создать пост',
    'toast.postLiked': 'Пост понравился',
    'toast.postUnliked': 'Лайк убран',
    'toast.postBookmarked': 'Пост добавлен в закладки',
    'toast.postUnbookmarked': 'Пост убран из закладок',
    'toast.jobCreated': 'Вакансия успешно создана',
    'toast.jobCreateError': 'Не удалось создать вакансию',
    'toast.jobUpdated': 'Вакансия успешно обновлена',
    'toast.jobUpdateError': 'Не удалось обновить вакансию',
    'toast.jobDeleted': 'Вакансия успешно удалена',
    'toast.jobDeleteError': 'Не удалось удалить вакансию',
    'toast.applicationSent': 'Заявка успешно отправлена',
    'toast.applicationError': 'Не удалось отправить заявку',
    'toast.offerSent': 'Предложение о работе отправлено',
    'toast.offerError': 'Не удалось отправить предложение',
    'toast.resumeCreated': 'Резюме успешно создано',
    'toast.resumeCreateError': 'Не удалось создать резюме',
    'toast.resumeUpdated': 'Резюме успешно обновлено',
    'toast.resumeUpdateError': 'Не удалось обновить резюме',
    'toast.resumeDeleted': 'Резюме успешно удалено',
    'toast.resumeDeleteError': 'Не удалось удалить резюме',
    'toast.snippetCreated': 'Фрагмент кода успешно создан',
    'toast.snippetCreateError': 'Не удалось создать фрагмент кода',
    'toast.snippetUpdated': 'Фрагмент кода успешно обновлен',
    'toast.snippetUpdateError': 'Не удалось обновить фрагмент кода',
    'toast.snippetDeleted': 'Фрагмент кода успешно удален',
    'toast.snippetDeleteError': 'Не удалось удалить фрагмент кода',
    'toast.userFollowed': 'Пользователь добавлен в подписки',
    'toast.userUnfollowed': 'Подписка отменена',
    'toast.followError': 'Не удалось подписаться на пользователя',
    'toast.languageChanged': 'Язык изменен на русский',
    'profile.noPosts': 'Нет постов',
    'profile.noPostsMessage': 'Поделитесь своим первым постом с сообществом!',
    'profile.noSnippets': 'Нет сниппетов кода',
    'profile.noSnippetsMessage': 'Поделитесь своим первым сниппетом кода с сообществом!',
    'profile.noLikes': 'Нет понравившихся постов',
    'profile.noLikesMessage': 'Отмечайте посты как понравившиеся, чтобы видеть их здесь!',
    'profile.notFound': 'Пользователь не найден',
    'profile.userNotExists': 'Этот пользователь не существует.',
    'profile.editProfile': 'Редактировать профиль',
    'profile.joinedDate': 'Присоединился {date}',
    'profile.likes': 'Понравившиеся',
    'profile.codeSnippets': 'Сниппеты кода',
    'profile.noPostsOwn': 'Вы еще ничего не опубликовали. Поделитесь своим первым постом!',
    'profile.noPostsUser': 'Этот пользователь еще ничего не опубликовал.',
    'profile.noLikesDesc': 'Понравившиеся посты будут отображаться здесь.',
    'profile.noSnippetsDesc': 'Сниппеты кода, созданные пользователем, будут отображаться здесь.',
    
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
    
    // Profile
    'profile.notFound': 'Пользователь не найден',
    'profile.userNotExists': 'Этот пользователь не существует.',
    'profile.editProfile': 'Редактировать профиль',
    'profile.followers': 'подписчиков',
    'profile.following': 'подписок',
    'profile.posts': 'Посты',
    'profile.likes': 'Лайки',
    'profile.codeSnippets': 'Сниппеты кода',
    'profile.noPosts': 'Пока нет постов',
    'profile.noPostsOwn': 'Вы еще ничего не публиковали. Поделитесь своим первым постом!',
    'profile.noPostsUser': 'Этот пользователь еще ничего не публиковал.',
    'profile.noLikes': 'Пока нет лайков',
    'profile.noLikesDesc': 'Посты, понравившиеся этому пользователю, появятся здесь.',
    'profile.noSnippets': 'Нет сниппетов кода',
    'profile.noSnippetsDesc': 'Сниппеты кода этого пользователя появятся здесь.',
    
    // Code Snippets
    'snippets.title': 'Сниппеты кода',
    'snippets.mySnippets': 'Мои сниппеты',
    'snippets.publicSnippets': 'Публичные сниппеты',
    'snippets.search': 'Поиск сниппетов...',
    'snippets.createNew': 'Создать сниппет',
    'snippets.addNew': 'Добавить новый сниппет',
    'snippets.snippetTitle': 'Название сниппета',
    'snippets.titlePlaceholder': 'Введите название сниппета',
    'snippets.description': 'Описание',
    'snippets.descriptionPlaceholder': 'Краткое описание сниппета',
    'snippets.code': 'Код',
    'snippets.codePlaceholder': 'Вставьте ваш код здесь...',
    'snippets.language': 'Язык программирования',
    'snippets.tags': 'Теги',
    'snippets.tagsPlaceholder': 'Введите теги через запятую',
    'snippets.makePublic': 'Сделать публичным',
    'snippets.createSnippet': 'Создать сниппет',
    'snippets.updateSnippet': 'Обновить сниппет',
    'snippets.public': 'Публичный',
    'snippets.private': 'Приватный',
    'snippets.createdAt': 'Создан',
    'snippets.share': 'Поделиться',
    'snippets.delete': 'Удалить',
    'snippets.edit': 'Редактировать',
    'snippets.noSnippets': 'Сниппеты не найдены',
    'snippets.noSnippetsDesc': 'Здесь будут отображаться ваши сниппеты кода',
    'snippets.noPublicSnippets': 'Нет публичных сниппетов',
    'snippets.noPublicSnippetsDesc': 'Публичные сниппеты от других пользователей появятся здесь',
    'snippets.createdSuccess': 'Сниппет успешно создан',
    'snippets.updatedSuccess': 'Сниппет успешно обновлен',
    'snippets.deletedSuccess': 'Сниппет успешно удален',
    'snippets.createError': 'Ошибка при создании сниппета',
    'snippets.updateError': 'Ошибка при обновлении сниппета',
    'snippets.deleteError': 'Ошибка при удалении сниппета',
    
    // Job Applications & Analytics
    'description': 'Описание',
    'requirements': 'Требования', 
    'skills': 'Навыки',
    'posted': 'Опубликовано',
    'created': 'Создано',
    'apply_now': 'Откликнуться',
    'already_applied': 'Уже откликнулись',
    'apply_for_job': 'Отклик на вакансию',
    'applying_for': 'Откликаетесь на',
    'cancel': 'Отменить',
    'send_application': 'Отправить отклик',
    'no_resumes_available': 'Нет доступных резюме',
    'create_resume_first': 'Сначала создайте резюме',
    'job_analytics': 'Аналитика вакансии',
    'view_analytics': 'Посмотреть аналитику',
    'total_applications': 'Всего откликов',
    'pending_applications': 'Ожидают рассмотрения',
    'accepted_applications': 'Принято',
    'rejected_applications': 'Отклонено',
    'applicants': 'Кандидаты',
    'anonymous': 'Аноним',
    'offer_job': 'Предложить вакансию',
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