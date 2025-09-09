# План разработки Telegram-бота и веб-приложения для обучающей платформы

## Описание проекта

Обучающая платформа с Telegram-ботом и веб-интерфейсом, где пользователи могут изучать различные темы, отслеживать прогресс, добавлять в избранное и просматривать завершенные уроки.

## Архитектура системы

### Backend (Node.js + TypeScript + Express)
- **База данных**: SQLite
- **API**: RESTful API для взаимодействия с фронтендом и ботом
- **Аутентификация**: JWT токены через Telegram Bot API (бот → backend → JWT)
- **Структура**: MVC паттерн

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Фреймворк**: Next.js 14 с App Router
- **Стилизация**: Tailwind CSS
- **Компоненты**: React компоненты с TypeScript
- **Состояние**: React Context или Zustand

### Telegram Bot (Node.js + Telegraf)
- **Библиотека**: Telegraf.js
- **Команды**: Навигация по темам и урокам
- **Интеграция**: Синхронизация с backend API

## Структура базы данных (SQLite)

### Таблицы:

1. **users**
   - id (PRIMARY KEY)
   - telegram_id (UNIQUE)
   - username
   - first_name
   - last_name
   - created_at
   - updated_at

2. **topics**
   - id (PRIMARY KEY)
   - title
   - description
   - is_published
   - created_at
   - updated_at

3. **lessons**
   - id (PRIMARY KEY)
   - topic_id (FOREIGN KEY)
   - title
   - content
   - order_index
   - is_published
   - created_at
   - updated_at

4. **progress**
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - lesson_id (FOREIGN KEY)
   - completed_at (NULL если не завершен)
   - created_at
   - updated_at

5. **favorites**
   - id (PRIMARY KEY)
   - user_id (FOREIGN KEY)
   - lesson_id (FOREIGN KEY)
   - created_at

## Этапы разработки

### Этап 1: Настройка проекта и Backend (1-2 дня)

#### 1.1 Инициализация проекта
- [ ] Создать структуру папок
- [ ] Настроить package.json для backend
- [ ] Настроить TypeScript (tsconfig.json)
- [ ] Настроить ESLint и Prettier
- [ ] Создать .env файл для конфигурации

#### 1.2 Backend API
- [ ] Установить зависимости (express, sqlite3, cors, dotenv)
- [ ] Создать подключение к SQLite
- [ ] Создать модели данных (User, Topic, Lesson, Progress, Favorites)
- [ ] Создать маршруты API:
  - `/api/users` - управление пользователями
  - `/api/topics` - управление темами
  - `/api/lessons` - управление уроками
  - `/api/progress` - отслеживание прогресса
  - `/api/favorites` - управление избранным
- [ ] Добавить middleware для обработки ошибок
- [ ] Настроить CORS для фронтенда

#### 1.3 База данных
- [ ] Создать SQL скрипты для инициализации таблиц
- [ ] Добавить тестовые данные
- [ ] Создать функции для работы с БД

### Этап 2: Telegram Bot (1-2 дня)

#### 2.1 Основная функциональность
- [ ] Настроить Telegraf.js
- [ ] Создать основные команды:
  - `/start` - регистрация пользователя
  - `/topics` - список доступных тем
  - `/progress` - показать прогресс
  - `/favorites` - избранные уроки
- [ ] Создать inline клавиатуры для навигации
- [ ] Интегрировать с backend API

#### 2.2 Дополнительные функции
- [ ] Система уведомлений
- [ ] Поиск по урокам
- [ ] Статистика обучения

### Этап 3: Frontend (Next.js) (2-3 дня)

#### 3.1 Настройка проекта
- [ ] Создать Next.js проект с TypeScript
- [ ] Настроить Tailwind CSS
- [ ] Создать базовую структуру компонентов
- [ ] Настроить маршрутизацию

#### 3.2 Основные страницы
- [ ] **Главная страница** (`/`)
  - Список всех тем
  - Общий прогресс пользователя
  - Поиск по темам

- [ ] **Страница темы** (`/topics/[id]`)
  - Список уроков в теме
  - Прогресс по теме
  - Кнопка "Начать изучение"

- [ ] **Страница урока** (`/lessons/[id]`)
  - Содержимое урока
  - Кнопки навигации (предыдущий/следующий)
  - Кнопка "Завершить урок"
  - Кнопка "Добавить в избранное"

- [ ] **Страница прогресса** (`/progress`)
  - Общая статистика
  - Завершенные уроки
  - Избранные уроки
  - Прогресс по темам

#### 3.3 Компоненты UI
- [ ] Header с навигацией
- [ ] Sidebar с меню
- [ ] Карточки тем и уроков
- [ ] Прогресс-бары
- [ ] Модальные окна
- [ ] Уведомления (toast)

### Этап 4: Интеграция и тестирование (1 день)

#### 4.1 Интеграция компонентов
- [ ] Подключить фронтенд к backend API
- [ ] Синхронизация данных между ботом и веб-приложением
- [ ] Тестирование всех функций

#### 4.2 Оптимизация
- [ ] Оптимизация запросов к БД
- [ ] Кэширование данных
- [ ] Обработка ошибок

### Этап 5: Админ-панель (опционально, 1-2 дня)

#### 5.1 Административный интерфейс
- [ ] **Страница управления темами** (`/admin/topics`)
  - Создание/редактирование/удаление тем
  - Публикация/снятие с публикации

- [ ] **Страница управления уроками** (`/admin/lessons`)
  - Создание/редактирование/удаление уроков
  - Изменение порядка уроков
  - Публикация/снятие с публикации

- [ ] **Статистика пользователей** (`/admin/users`)
  - Список пользователей
  - Статистика по прогрессу
  - Активность пользователей

## Технологический стек

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite3
- **ORM**: Нативные SQL запросы
- **Environment**: dotenv
- **CORS**: cors middleware

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **HTTP Client**: Fetch API / Axios
- **Icons**: Lucide React / Heroicons

### Telegram Bot
- **Library**: Telegraf.js
- **Language**: TypeScript
- **HTTP Client**: Axios для API запросов

### Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git

## Структура файлов проекта

```
tg-learning-platform/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Topic.ts
│   │   │   ├── Lesson.ts
│   │   │   └── Progress.ts
│   │   ├── routes/
│   │   │   ├── userRoutes.ts
│   │   │   ├── topicRoutes.ts
│   │   │   ├── lessonRoutes.ts
│   │   │   └── progressRoutes.ts
│   │   ├── database/
│   │   │   ├── db.ts
│   │   │   └── init.sql
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── topics/
│   │   │   ├── lessons/
│   │   │   ├── progress/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── telegram-bot/
│   ├── src/
│   │   ├── bot.ts
│   │   ├── commands/
│   │   ├── keyboards/
│   │   └── utils/
│   ├── package.json
│   └── .env
└── README.md
```

## API Endpoints

### Users
- `GET /api/users` - получить всех пользователей
- `GET /api/users/:id` - получить пользователя по ID
- `GET /api/users/telegram/:telegramId` - получить пользователя по Telegram ID
- `POST /api/users` - создать пользователя
- `PUT /api/users/:id` - обновить пользователя
- `DELETE /api/users/:id` - удалить пользователя

### Topics
- `GET /api/topics` - получить все темы
- `GET /api/topics/:id` - получить тему по ID
- `POST /api/topics` - создать тему
- `PUT /api/topics/:id` - обновить тему
- `DELETE /api/topics/:id` - удалить тему

### Lessons
- `GET /api/lessons` - получить все уроки
- `GET /api/lessons/:id` - получить урок по ID
- `GET /api/lessons/topic/:topicId` - получить уроки по теме
- `POST /api/lessons` - создать урок
- `PUT /api/lessons/:id` - обновить урок
- `DELETE /api/lessons/:id` - удалить урок

### Progress
- `GET /api/progress/user/:userId` - получить прогресс пользователя
- `GET /api/progress/user/:userId/topic/:topicId` - прогресс по теме
- `POST /api/progress` - создать запись о прогрессе
- `PATCH /api/progress/:id` - обновить прогресс
- `POST /api/progress/:id/reset` - сбросить прогресс урока

### Favorites
- `GET /api/favorites/user/:userId` - получить избранные уроки пользователя
- `POST /api/favorites` - добавить урок в избранное
- `DELETE /api/favorites/:id` - удалить из избранного

## Команды Telegram бота

### Основные команды
- `/start` - Начать работу с ботом, регистрация
- `/help` - Помощь по командам
- `/topics` - Показать все доступные темы
- `/progress` - Показать мой прогресс
- `/favorites` - Показать избранные уроки
- `/completed` - Показать завершенные уроки
- `/stats` - Статистика обучения

### Inline клавиатуры
- Навигация по темам
- Выбор уроков в теме
- Управление избранным
- Отметка о завершении урока

## Дополнительные возможности (для будущих версий)

1. **Система достижений**
   - Бейджи за завершение тем
   - Награды за активность

2. **Социальные функции**
   - Рейтинг пользователей
   - Комментарии к урокам

3. **Расширенная аналитика**
   - Время изучения
   - Сложные места в уроках

4. **Мультимедиа контент**
   - Видео уроки
   - Интерактивные задания

5. **Мобильное приложение**
   - React Native приложение

## Временные рамки

- **Общее время разработки**: 10-14 дней
- **MVP версия**: 7-10 дней
- **Полная версия с админкой**: 12-14 дней

## Заключение

Данный план предоставляет пошаговое руководство для создания полнофункциональной обучающей платформы с Telegram-ботом и веб-интерфейсом. Проект использует современные технологии и может быть легко расширен в будущем.