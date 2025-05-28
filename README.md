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

- **Node.js** 18.0.0 или выше
- **PostgreSQL** 14.0 или выше
- **npm** или **yarn**

## 🚀 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/devstream.git
cd devstream
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=postgresql://username:password@localhost:5432/devstream
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=devstream

# OpenAI для ИИ-функций
OPENAI_API_KEY=your_openai_api_key

# Сессии
SESSION_SECRET=your_very_long_random_secret_key

# Для продакшена (опционально)
NODE_ENV=production
PORT=5000
```

### 4. Настройка базы данных

#### Создание базы данных:
```sql
-- Подключитесь к PostgreSQL и выполните:
CREATE DATABASE devstream;
CREATE USER devstream_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE devstream TO devstream_user;
```

#### Применение миграций:
```bash
npm run db:push
```

### 5. Запуск проекта

#### Режим разработки:
```bash
npm run dev
```

#### Режим продакшена:
```bash
npm run build
npm start
```

Приложение будет доступно по адресу: `http://localhost:5000`

## 🔧 Скрипты

```bash
# Разработка
npm run dev          # Запуск в режиме разработки

# Сборка
npm run build        # Сборка для продакшена
npm start            # Запуск продакшен версии

# База данных
npm run db:push      # Применение изменений схемы к БД
npm run db:generate  # Генерация миграций

# Типы
npm run type-check   # Проверка типов TypeScript
```

## 🐳 Docker развертывание

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/devstream
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=devstream
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Запуск с Docker:
```bash
docker-compose up -d
```

## 🔑 Получение API ключей

### OpenAI API
1. Зарегистрируйтесь на [OpenAI Platform](https://platform.openai.com)
2. Перейдите в раздел API Keys
3. Создайте новый ключ
4. Добавьте его в переменную `OPENAI_API_KEY`

## 🏗 Архитектура проекта

```
devstream/
├── client/                 # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── hooks/         # Кастомные хуки
│   │   └── lib/           # Утилиты
├── server/                # Backend приложение
│   ├── index.ts          # Главный файл сервера
│   ├── routes.ts         # API роуты
│   ├── storage.ts        # Слой данных
│   └── auth.ts           # Аутентификация
├── shared/               # Общие типы и схемы
│   └── schema.ts         # Схемы базы данных
└── package.json
```

## 🔐 Безопасность

- Пароли хэшируются с помощью bcrypt
- Сессии хранятся в базе данных
- CSRF защита включена
- Валидация данных на уровне API
- Санитизация пользовательского ввода

## 🌐 Продакшен развертывание

### На VPS/выделенном сервере:

1. **Подготовка сервера:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Настройка Nginx
sudo nano /etc/nginx/sites-available/devstream
```

2. **Конфигурация Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

3. **SSL с Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

4. **Systemd сервис:**
```bash
sudo nano /etc/systemd/system/devstream.service
```

```ini
[Unit]
Description=DevStream App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/devstream
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable devstream
sudo systemctl start devstream
```

## 📝 Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DATABASE_URL` | URL подключения к PostgreSQL | ✅ |
| `OPENAI_API_KEY` | Ключ OpenAI API | ✅ |
| `SESSION_SECRET` | Секретный ключ для сессий | ✅ |
| `PORT` | Порт сервера | ❌ (по умолчанию 5000) |
| `NODE_ENV` | Окружение (development/production) | ❌ |

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

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