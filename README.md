
# DevStream - Социальная платформа для IT-специалистов

**DevStream** — это современная социальная платформа, специально созданная для IT-профессионалов. Платформа объединяет возможности социальных сетей с профессиональными инструментами для разработчиков, включая поиск работы, обмен кодом и ИИ-ассистента.

## 🚀 Особенности

### 🌟 Основной функционал
- **Социальная лента**: Публикация постов с поддержкой кода и синтаксической подсветкой
- **Система подписок**: Подписывайтесь на других разработчиков и следите за их активностью
- **Поиск и хэштеги**: Находите контент по интересующим технологиям
- **Лайки и закладки**: Сохраняйте и отмечайте полезные посты

### 💼 Профессиональные инструменты
- **Поиск работы**: Просматривайте вакансии и откликайтесь на них
- **Создание резюме**: Создавайте и публикуйте свои резюме
- **Двустороннее взаимодействие**: Рекрутеры могут предлагать работу владельцам резюме
- **Сниппеты кода**: Делитесь полезными фрагментами кода с подсветкой синтаксиса

### 🤖 ИИ-возможности
- **ИИ-ассистент**: Получайте помощь в программировании и создании контента
- **Анализ кода**: ИИ анализирует ваши посты и предлагает улучшения
- **Генерация идей**: Получайте предложения для новых постов
- **Многоязычная поддержка**: ИИ отвечает на языке вопроса

### 🌍 Интернационализация
- **Русский и английский интерфейс**: Полная локализация
- **Автоматическое определение языка**: ИИ отвечает на том же языке
- **Переключение языка в реальном времени**: Мгновенная смена интерфейса

## 🛠 Технологический стек

### Frontend
- **React 18** с TypeScript
- **Vite** для быстрой разработки
- **Tailwind CSS** для стилизации
- **Shadcn/ui** компоненты
- **Wouter** для маршрутизации
- **TanStack Query** для управления состоянием сервера
- **Framer Motion** для анимаций

### Backend
- **Node.js** с Express
- **TypeScript** для типизации
- **PostgreSQL** база данных
- **Drizzle ORM** для работы с БД
- **Passport.js** для аутентификации
- **OpenAI API** для ИИ-функций
- **bcrypt** для шифрования паролей

### Дополнительные инструменты
- **highlight.js** для подсветки синтаксиса
- **date-fns** для работы с датами
- **zod** для валидации данных
- **react-hook-form** для форм

## 📋 Требования

- **Node.js** 20.0.0 или выше
- **PostgreSQL** 14.0 или выше
- **npm** или **yarn**

## 🏗 Архитектура проекта

```
devstream/
├── client/                    # Frontend приложение
│   ├── src/
│   │   ├── components/       # React компоненты
│   │   │   ├── ui/          # UI компоненты (shadcn/ui)
│   │   │   ├── ApplyJobDialog.tsx
│   │   │   ├── CodeSnippet.tsx
│   │   │   ├── CreateJobDialog.tsx
│   │   │   ├── CreatePostCard.tsx
│   │   │   ├── CreateResumeDialog.tsx
│   │   │   ├── EditJobDialog.tsx
│   │   │   ├── EditProfileDialog.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── JobDetailDialog.tsx
│   │   │   ├── LanguageProvider.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── MobileNavigation.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── OfferJobDialog.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── ResumeDetailDialog.tsx
│   │   │   ├── RightSidebar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── pages/           # Страницы приложения
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── Bookmarks.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Resumes.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Snippets.tsx
│   │   │   ├── Work.tsx
│   │   │   └── not-found.tsx
│   │   ├── hooks/           # Кастомные хуки
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useLanguage.ts
│   │   ├── lib/            # Утилиты
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx         # Главный компонент
│   │   ├── main.tsx        # Точка входа
│   │   └── index.css       # Глобальные стили
│   └── index.html          # HTML шаблон
├── server/                 # Backend приложение
│   ├── index.ts           # Главный файл сервера
│   ├── routes.ts          # API роуты
│   ├── storage.ts         # Слой данных
│   ├── auth.ts            # Аутентификация
│   ├── ai.ts              # ИИ интеграция
│   └── vite.ts            # Vite интеграция
├── shared/                # Общие типы и схемы
│   └── schema.ts          # Схемы базы данных
├── .replit               # Конфигурация Replit
├── package.json          # Зависимости проекта
├── tsconfig.json         # Конфигурация TypeScript
├── vite.config.ts        # Конфигурация Vite
├── tailwind.config.ts    # Конфигурация Tailwind
├── drizzle.config.ts     # Конфигурация Drizzle ORM
├── postcss.config.js     # Конфигурация PostCSS
└── components.json       # Конфигурация shadcn/ui
```

## 🚀 Быстрый запуск на Replit

### Пошаговая инструкция

1. **Установите зависимости**:
```bash
npm install
```

2. **Создайте файл переменных окружения**:
Создайте файл `.env` в корне проекта с содержимым:
```env
# База данных (для разработки используем встроенную SQLite)
DATABASE_URL=file:./dev.db

# ИИ для функций
GEMINI_API_KEY=ключ


# Сессии
SESSION_SECRET=dev-session-secret-key-for-development-only

# Для разработки
NODE_ENV=development
PORT=5000
```

3. **Запустите проект**:
Нажмите кнопку **Run** или выполните команду:
```bash
npm run dev
```

4. **Готово!** 
Приложение будет доступно в веб-превью Replit на порту 5000.

**Примечание**: В проекте уже настроены демо-данные, поэтому вы сразу увидите контент после запуска.

---

## 🚀 Установка и запуск (для других платформ)

### Локальная разработка

#### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/devstream.git
cd devstream
```

#### 2. Установка зависимостей
```bash
npm install
```

#### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=postgresql://username:password@localhost:5432/devstream

# OpenAI для ИИ-функций
OPENAI_API_KEY=your_openai_api_key

# Сессии
SESSION_SECRET=your_very_long_random_secret_key

# Для продакшена (опционально)
NODE_ENV=development
PORT=5000
```

#### 4. Настройка базы данных PostgreSQL

```bash
# Создание базы данных
sudo -u postgres createdb devstream
sudo -u postgres createuser devstream_user
sudo -u postgres psql -c "ALTER USER devstream_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE devstream TO devstream_user;"

# Применение схемы базы данных
npm run db:push
```

#### 5. Запуск проекта
```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5000`

## 🌐 Развертывание

### На Replit (рекомендуется)

Для развертывания на Replit:

1. **Убедитесь, что проект работает в режиме разработки**
2. **Настройте переменные окружения для продакшена** в файле `.env`:
```env
DATABASE_URL=file:./production.db
GEMINI_API_KEY=your_production_gemini_api_key
OPENAI_API_KEY=your_production_openai_api_key
SESSION_SECRET=very_long_random_secret_for_production
NODE_ENV=production
PORT=5000
```

3. **Перейдите в раздел Deployments в Replit**
4. **Нажмите Deploy** для публикации приложения

Ваше приложение будет автоматически развернуто и доступно по публичному URL.

---

## 🖥️ Развертывание на Ubuntu сервере (альтернатива)

### Предварительные требования
- Ubuntu 20.04 LTS или выше
- Пользователь с правами sudo
- Доменное имя (опционально)

### 1. Обновление системы
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Установка Node.js 20
```bash
# Добавление NodeSource репозитория
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js
sudo apt install -y nodejs

# Проверка установки
node --version
npm --version
```

### 3. Установка PostgreSQL
```bash
# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запуск и автозапуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Настройка пользователя PostgreSQL
sudo -u postgres psql
```

В PostgreSQL консоли выполните:
```sql
CREATE DATABASE devstream;
CREATE USER devstream_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE devstream TO devstream_user;
\q
```

### 4. Установка Nginx
```bash
sudo apt install -y nginx

# Запуск и автозапуск Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Настройка файрвола
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 6. Клонирование и настройка проекта
```bash
# Создание директории для проекта
sudo mkdir -p /var/www/devstream
sudo chown $USER:$USER /var/www/devstream

# Клонирование репозитория
cd /var/www/devstream
git clone https://github.com/your-username/devstream.git .

# Установка зависимостей
npm install

# Создание файла переменных окружения
sudo nano .env
```

Содержимое `.env` файла:
```env
# База данных
DATABASE_URL=postgresql://devstream_user:secure_password_here@localhost:5432/devstream

# OpenAI для ИИ-функций
OPENAI_API_KEY=your_openai_api_key

# Сессии
SESSION_SECRET=very_long_random_secret_key_at_least_32_characters

# Продакшен настройки
NODE_ENV=production
PORT=5000
```

### 7. Применение схемы базы данных
```bash
npm run db:push
```

### 8. Сборка проекта
```bash
npm run build
```

### 9. Создание systemd сервиса
```bash
sudo nano /etc/systemd/system/devstream.service
```

Содержимое файла:
```ini
[Unit]
Description=DevStream Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/devstream
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Изменение владельца файлов
sudo chown -R www-data:www-data /var/www/devstream

# Запуск и автозапуск сервиса
sudo systemctl daemon-reload
sudo systemctl enable devstream
sudo systemctl start devstream

# Проверка статуса
sudo systemctl status devstream
```

### 10. Настройка Nginx
```bash
sudo nano /etc/nginx/sites-available/devstream
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Замените на ваш домен

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/devstream /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 11. Установка SSL сертификата (Let's Encrypt)
```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление сертификатов
sudo crontab -e
```

Добавьте в crontab:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

### 12. Оптимизация для продакшена

#### Настройка лимитов файлов
```bash
sudo nano /etc/security/limits.conf
```

Добавьте:
```
www-data soft nofile 65536
www-data hard nofile 65536
```

#### Настройка swap (если нужно)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 13. Мониторинг и логи
```bash
# Просмотр логов приложения
sudo journalctl -u devstream -f

# Просмотр логов Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверка использования ресурсов
htop
```

## 🔧 Скрипты

```bash
# Разработка
npm run dev          # Запуск в режиме разработки

# Сборка
npm run build        # Сборка для продакшена
npm start            # Запуск продакшен версии

# База данных
npm run db:push      # Применение изменений схемы к БД

# Типы
npm run check        # Проверка типов TypeScript
```

## 🔄 Обновление приложения на сервере

```bash
cd /var/www/devstream

# Остановка сервиса
sudo systemctl stop devstream

# Получение последних изменений
git pull origin main

# Установка новых зависимостей
npm install

# Сборка проекта
npm run build

# Применение изменений БД (если есть)
npm run db:push

# Запуск сервиса
sudo systemctl start devstream

# Проверка статуса
sudo systemctl status devstream
```

## 📝 Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DATABASE_URL` | URL подключения к PostgreSQL | ✅ |
| `OPENAI_API_KEY` | Ключ OpenAI API для ИИ-функций | ✅ |
| `SESSION_SECRET` | Секретный ключ для сессий (мин. 32 символа) | ✅ |
| `PORT` | Порт сервера | ❌ (по умолчанию 5000) |
| `NODE_ENV` | Окружение (development/production) | ❌ |

## 🔑 Получение API ключей

### OpenAI API
1. Зарегистрируйтесь на [OpenAI Platform](https://platform.openai.com)
2. Перейдите в раздел API Keys
3. Создайте новый ключ
4. Добавьте его в переменную `OPENAI_API_KEY`

## 🔐 Безопасность

- Пароли хэшируются с помощью bcrypt
- Сессии хранятся в базе данных с использованием connect-pg-simple
- CSRF защита включена
- Валидация данных на уровне API с помощью Zod
- Санитизация пользовательского ввода

## 🎨 Возможности интерфейса

- **Темная/светлая тема**: Автоматическое переключение
- **Адаптивный дизайн**: Оптимизировано для всех устройств
- **Мобильная навигация**: Удобное меню для смартфонов
- **Бесконечная прокрутка**: Плавная загрузка контента
- **Живые уведомления**: Мгновенные обновления активности

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 🐛 Решение проблем

### Частые проблемы на Replit

#### Ошибка "tsx: not found"
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

#### Проблемы с переменными окружения
Убедитесь, что файл `.env` создан в корне проекта и содержит все необходимые переменные.

#### Проект не запускается после клонирования
```bash
# Последовательно выполните:
npm install
# Создайте .env файл с переменными выше
npm run dev
```

#### Ошибки с базой данных
Проект использует SQLite для разработки, база создается автоматически. Если возникают проблемы:
```bash
rm dev.db  # Удалить старую базу
npm run dev  # Перезапустить - база создастся заново
```

---

### Частые проблемы на других платформах

#### Приложение не запускается
```bash
# Проверьте логи
sudo journalctl -u devstream -n 50

# Проверьте переменные окружения
cat .env

# Проверьте права доступа
ls -la /var/www/devstream
```

#### Ошибки базы данных
```bash
# Проверьте подключение к PostgreSQL
sudo -u postgres psql -c "SELECT version();"

# Проверьте пользователя базы данных
sudo -u postgres psql -c "\du"
```

#### Nginx ошибки
```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

## 📄 Лицензия

Этот проект лицензирован под MIT License. См. файл [LICENSE](LICENSE) для подробностей.

## 👥 Авторы

- **Разработчик** - [Ваше имя](https://github.com/your-username)

## 🐛 Сообщение об ошибках

Если вы нашли ошибку, пожалуйста:
1. Проверьте [существующие issues](https://github.com/your-username/devstream/issues)
2. Создайте новый issue с подробным описанием
3. Приложите скриншоты и логи если возможно

## 📞 Поддержка

- 📧 Email: support@devstream.com
- 💬 Telegram: [@devstream_support](https://t.me/devstream_support)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/devstream/issues)

---

**DevStream** - объединяем разработчиков по всему миру! 🌍👨‍💻👩‍💻
