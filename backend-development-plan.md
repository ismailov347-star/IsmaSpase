# План разработки Backend для IsmaSpace

## Обзор проекта

IsmaSpace - это образовательная платформа, интегрированная с Telegram WebApp. Frontend построен на Next.js с TypeScript, использует Tailwind CSS для стилизации и содержит следующие основные особенности:

### Текущая структура фронтенда:
- **Главная страница** - одна основная тема "Практикум СИСТЕМА ЛЁГКОГО КОНТЕНТА"
- **VideoPlayer компонент** - поддержка полноэкранного режима, управление скоростью воспроизведения
- **Статические данные** - тема 1 использует хардкод данные с 4 уроками
- **localStorage** - сохранение прогресса пользователя локально
- **Telegram WebApp интеграция** - полная поддержка Telegram WebApp API
- **Адаптивный дизайн** - современный UI с анимациями и эффектами

### Основные компоненты:
- **VideoPlayer** - воспроизведение видео с кастомными контролами
- **ButtonCta** - интерактивные кнопки с анимациями
- **FlickeringGrid** - анимированный фон
- **Navigation** - навигация между страницами
- **TelegramWebApp** - интеграция с Telegram

## Архитектура Backend

### Технологический стек

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: Telegram ID
- **Environment**: dotenv для конфигурации

### Структура проекта

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── themeController.js
│   │   ├── lessonController.js
│   │   ├── progressController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── themes.js
│   │   ├── lessons.js
│   │   ├── progress.js
│   │   └── admin.js
│   ├── services/
│   │   ├── telegramService.js
│   │   ├── userService.js
│   │   └── progressService.js
│   ├── utils/
│   │   ├── telegram.js
│   │   └── validators.js
│   └── app.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── .env
└── server.js
```

## Модели данных (Prisma Schema)

### User (Пользователь)
```prisma
model User {
  id          Int      @id @default(autoincrement())
  telegramId  String   @unique
  username    String?
  firstName   String?
  lastName    String?
  isAdmin     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  progress    Progress[]
  favorites   Favorite[]
}
```

### Topic (Тема обучения)
```prisma
model Topic {
  id          Int      @id @default(autoincrement())
  title       String   @unique
  description String
  icon        String?
  emoji       String?
  isActive    Boolean  @default(true)
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  lessons     Lesson[]
}
```

### Lesson (Урок)
```prisma
model Lesson {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  videoUrl    String?  // URL видео (YouTube, Miro, etc.)
  duration    Int?     // в минутах
  orderIndex  Int      @default(0)
  topicId     Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  topic       Topic    @relation(fields: [topicId], references: [id])
  progress    Progress[]
  favorites   Favorite[]
  tips        LessonTip[]
  materials   LessonMaterial[]
  files       LessonFile[]
}
```

### LessonTip (Советы к урокам)
```prisma
model LessonTip {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  lessonId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Связи
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

### LessonMaterial (Дополнительные материалы)
```prisma
model LessonMaterial {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  url         String?
  type        String   @default("link") // link, document, video, image
  lessonId    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

### LessonFile (Файлы уроков)
```prisma
model LessonFile {
  id        Int      @id @default(autoincrement())
  filename  String
  url       String
  type      String   @default("document") // document, image, video, audio, archive
  lessonId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Связи
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

### Progress (Прогресс пользователя)
```prisma
model Progress {
  id          Int      @id @default(autoincrement())
  userId      Int
  lessonId    Int
  completed   Boolean  @default(false)
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  user        User     @relation(fields: [userId], references: [id])
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
  
  @@unique([userId, lessonId])
}
```

### Favorite (Избранные уроки)
```prisma
model Favorite {
  id        Int      @id @default(autoincrement())
  userId    Int
  lessonId  Int
  createdAt DateTime @default(now())
  
  // Связи
  user      User     @relation(fields: [userId], references: [id])
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  
  @@unique([userId, lessonId])
}
```

## API Endpoints

### Аутентификация
- `POST /api/auth/telegram` - аутентификация через Telegram ID
- `GET /api/auth/me` - получение информации о текущем пользователе
- `POST /api/auth/logout` - выход из системы

### Пользователи
- `GET /api/users/profile` - профиль пользователя
- `PUT /api/users/profile` - обновление профиля
- `GET /api/users/stats` - статистика пользователя

### Темы (Topics)
- `GET /api/topics` - список всех активных тем с прогрессом
- `GET /api/topics/:id` - детали темы
- `GET /api/topics/:id/lessons` - уроки по теме с прогрессом

### Уроки
- `GET /api/lessons` - список всех уроков (поддерживает параметр `include=tips,materials,files,topic`)
- `GET /api/lessons/:id` - детали урока с информацией о теме
- `POST /api/lessons/:id/complete` - отметить урок как завершенный
- `GET /api/lessons/search` - поиск уроков

### Советы к урокам (Tips)
- `POST /api/lessons/:lessonId/tips` - создание совета для урока
- `PUT /api/tips/:id` - обновление совета
- `DELETE /api/tips/:id` - удаление совета

### Материалы уроков (Materials)
- `POST /api/lessons/:lessonId/materials` - создание материала для урока
- `PUT /api/materials/:id` - обновление материала
- `DELETE /api/materials/:id` - удаление материала

### Файлы уроков (Files)
- `POST /api/lessons/:lessonId/files` - создание файла для урока
- `PUT /api/files/:id` - обновление файла
- `DELETE /api/files/:id` - удаление файла

### Прогресс
- `GET /api/progress` - прогресс пользователя
- `POST /api/progress/:lessonId/complete` - отметить урок как завершенный
- `DELETE /api/progress/:lessonId` - сбросить прогресс урока

### Избранное
- `GET /api/favorites` - избранные уроки пользователя
- `POST /api/favorites/:lessonId` - добавить в избранное
- `DELETE /api/favorites/:lessonId` - удалить из избранного

### Админ панель
- `GET /api/admin/users` - список пользователей
- `GET /api/admin/stats` - общая статистика
- `POST /api/admin/topics` - создание темы
- `PUT /api/admin/topics/:id` - обновление темы
- `DELETE /api/admin/topics/:id` - удаление темы
- `POST /api/admin/lessons` - создание урока
- `PUT /api/admin/lessons/:id` - обновление урока
- `DELETE /api/admin/lessons/:id` - удаление урока
- `POST /api/admin/sync-static-data` - синхронизация статических данных с БД

## Интеграция с фронтендом

### Особенности работы с Telegram WebApp
- Получение данных пользователя через `window.Telegram.WebApp`
- Автоматическая аутентификация при запуске приложения
- Адаптация под тему Telegram (светлая/темная)
- Использование Telegram UI компонентов (кнопки, навигация)

### Статические данные vs База данных
- Фронтенд использует статические данные из `data/` папки
- Бэкенд должен поддерживать синхронизацию статических данных с БД
- Возможность работы в оффлайн режиме через localStorage
- Постепенная миграция на динамические данные

### VideoPlayer интеграция
- Поддержка различных источников видео (YouTube, Miro, прямые ссылки)
- Сохранение прогресса просмотра в localStorage и БД
- Синхронизация настроек воспроизведения между устройствами

## Аутентификация через Telegram

### Принцип работы
1. Frontend получает данные пользователя из Telegram WebApp
2. Отправляет `initData` на backend для валидации
3. Backend проверяет подпись данных через Telegram Bot API
4. При успешной валидации создается/обновляется пользователь
5. Возвращается JWT токен для дальнейших запросов

### Middleware аутентификации
```javascript
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { telegramId: decoded.telegramId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};
```

### Middleware для админов
```javascript
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};
```

## Этапы разработки

### Этап 1: Базовая настройка и интеграция ✅ ЗАВЕРШЕН
- [x] Настройка проекта и зависимостей
- [x] Настройка базы данных (SQLite)
- [x] Создание базовых моделей (User, Topic, Lesson)
- [x] Настройка Prisma ORM
- [x] Базовая структура Express приложения
- [x] Анализ статических данных фронтенда

### Этап 2: Аутентификация Telegram ⏳ В ПРОЦЕССЕ
- [ ] Интеграция с Telegram WebApp API
- [ ] Проверка подписи Telegram данных
- [ ] JWT токены и middleware
- [ ] Базовые endpoints для пользователей
- [ ] Тестирование с фронтендом

### Этап 3: Миграция данных и основной API ✅ ЗАВЕРШЕН
- [x] Импорт статических данных в БД
- [x] API endpoints для topics и lessons
- [x] Система прогресса обучения с localStorage синхронизацией
- [x] Система избранного
- [x] API совместимый с текущим фронтендом
- [x] **ДОПОЛНИТЕЛЬНО:** Расширенная модель уроков с советами, материалами и файлами
- [x] **ДОПОЛНИТЕЛЬНО:** API для управления советами, материалами и файлами
- [x] **ДОПОЛНИТЕЛЬНО:** Поддержка параметра include в API lessons

### Этап 4: VideoPlayer и прогресс (1-2 недели)
- [ ] API для сохранения прогресса видео
- [ ] Поддержка различных источников видео
- [ ] Синхронизация настроек воспроизведения
- [ ] Статистика просмотров

### Этап 5: Дополнительные функции ✅ ЧАСТИЧНО ЗАВЕРШЕН
- [ ] Поиск по урокам
- [ ] Система уведомлений через Telegram Bot
- [x] **Админ панель для управления контентом** - реализована расширенная админ панель
- [x] **Синхронизация статических данных** - реализована через API
- [x] **ДОПОЛНИТЕЛЬНО:** Полнофункциональная админ панель с управлением советами, материалами и файлами

### Этап 6: Тестирование и оптимизация (1 неделя)
- [x] **Базовое тестирование** - проверена работа всех новых endpoints
- [ ] Unit тесты
- [ ] Integration тесты с фронтендом
- [ ] Оптимизация производительности
- [ ] Настройка CI/CD
- [ ] Деплой на продакшн

## Зависимости (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "crypto": "^1.0.1",
    "node-telegram-bot-api": "^0.61.0",
    "axios": "^1.4.0",
    "multer": "^1.4.5",
    "sharp": "^0.32.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/node": "^20.4.0",
    "@types/multer": "^1.4.7"
  }
}
```

## Переменные окружения (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Telegram
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_BOT_USERNAME="your-bot-username"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

## Безопасность

### Меры безопасности
- Валидация всех входящих данных
- Rate limiting для API endpoints
- CORS настройки
- Helmet для безопасности заголовков
- Проверка Telegram подписи
- JWT токены с истечением срока
- Хеширование чувствительных данных

### Валидация Telegram данных
```javascript
const validateTelegramData = (initData, botToken) => {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
};
```

## Текущее состояние проекта

### ✅ Реализованный функционал

**Backend (API):**
- Полная настройка Express.js сервера с CORS
- Интеграция с Prisma ORM и SQLite базой данных
- Расширенная модель данных с поддержкой советов, материалов и файлов
- RESTful API endpoints для всех сущностей
- Поддержка параметра `include` для загрузки связанных данных
- Валидация данных и обработка ошибок

**Frontend (Админ панель):**
- Современный интерфейс на React с Tailwind CSS
- Полное управление темами, уроками, советами, материалами и файлами
- Формы создания и редактирования с валидацией
- Интуитивная навигация и пользовательский опыт
- Интеграция с backend API

**Интеграция:**
- Полная синхронизация между frontend и backend
- Корректная работа всех CRUD операций
- Поддержка загрузки файлов и управления материалами
- Работающие серверы на портах 3002 (backend) и 5173 (frontend)

### 🔄 В процессе разработки
- Аутентификация через Telegram WebApp API
- Система прогресса видео
- Поиск по урокам

## Мониторинг и логирование

- Логирование всех API запросов
- Отслеживание ошибок
- Мониторинг производительности
- Статистика использования

## Предотвращение ошибок и лучшие практики

### 1. Синхронизация данных между БД и файловой структурой

**Проблема:** Несоответствие между slug в базе данных и именами папок/файлов во frontend

**Решения:**
- Создать единую систему именования для URL и папок
- Использовать автоматические скрипты валидации данных
- Внедрить pre-commit hooks для проверки целостности
- Создать документацию по naming conventions

**Рекомендуемые скрипты для валидации:**
```javascript
// scripts/validate-slugs.js - проверка соответствия slug и папок
// scripts/sync-database.js - синхронизация БД с файловой структурой
// scripts/check-integrity.js - общая проверка целостности данных
```

### 2. Валидация данных и типизация

**Проблема:** Неправильная структура данных может привести к ошибкам рендеринга

**Решения:**
- Использовать строгую валидацию с Joi или Zod
- Добавить TypeScript для типизации API ответов
- Создать схемы валидации для всех endpoints
- Проводить валидацию на уровне БД (Prisma constraints)

**Пример валидации:**
```javascript
const lessonSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().optional(),
  duration: Joi.number().integer().min(1).required()
});
```

### 3. Автоматическое тестирование

**Проблема:** Ошибки обнаруживаются только в production

**Решения:**
- Unit тесты для всех контроллеров
- Integration тесты для API endpoints
- E2E тесты для критических путей
- Автоматические тесты в CI/CD pipeline

**Структура тестов:**
```
tests/
├── unit/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── themes.test.js
│   └── lessons.test.js
└── e2e/
    └── user-journey.test.js
```

### 4. Мониторинг и логирование

**Проблема:** Сложно отследить источник ошибок

**Решения:**
- Структурированное логирование (Winston)
- Мониторинг ошибок (Sentry)
- Метрики производительности
- Health checks для всех сервисов

**Пример логирования:**
```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 5. Миграции и версионирование БД

**Проблема:** Изменения в схеме БД могут сломать существующие данные

**Решения:**
- Всегда создавать миграции для изменений схемы
- Тестировать миграции на копии production данных
- Создавать rollback скрипты
- Версионировать API endpoints

### 6. Обработка ошибок

**Проблема:** Неинформативные ошибки затрудняют отладку

**Решения:**
- Централизованная обработка ошибок
- Информативные сообщения об ошибках
- Разные уровни детализации для dev/prod
- Коды ошибок для frontend

**Пример middleware для ошибок:**
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
```

### 7. Документация API

**Проблема:** Отсутствие документации затрудняет интеграцию с frontend

**Решения:**
- Использовать Swagger/OpenAPI для документации
- Автоматическая генерация документации из кода
- Примеры запросов и ответов
- Интерактивная документация

### 8. Процесс разработки

**Рекомендуемый workflow:**
1. **Планирование** - детальный анализ требований
2. **Проектирование** - создание схем БД и API
3. **Разработка** - поэтапная реализация с тестами
4. **Code Review** - проверка кода коллегами
5. **Тестирование** - автоматические и ручные тесты
6. **Валидация** - скрипты проверки целостности
7. **Деплой** - поэтапное развертывание
8. **Мониторинг** - отслеживание работы в production

### 9. Инструменты для предотвращения ошибок

**Обязательные инструменты:**
- ESLint + Prettier для форматирования кода
- Husky для pre-commit hooks
- Jest для тестирования
- Prisma для типобезопасной работы с БД
- Joi/Zod для валидации данных
- Winston для логирования
- Sentry для мониторинга ошибок

### 10. Checklist перед деплоем

- [ ] Все тесты проходят
- [ ] Миграции БД протестированы
- [ ] Переменные окружения настроены
- [ ] Логирование работает корректно
- [ ] API документация обновлена
- [ ] Скрипты валидации данных выполнены
- [ ] Backup стратегия настроена
- [ ] Мониторинг настроен
- [ ] Rate limiting настроен
- [ ] CORS правильно сконфигурирован

## Развертывание и мониторинг

### Переменные окружения
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ismaspace"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Telegram
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_WEBHOOK_SECRET="your-webhook-secret"

# App
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend-domain.com"

# Logging
LOG_LEVEL="info"
```

### Docker конфигурация
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## Рекомендации по предотвращению ошибок

### Валидация данных
- Использовать Joi для валидации входящих данных
- Проверять типы данных на уровне TypeScript
- Валидировать Telegram данные перед обработкой
- Проверять совместимость с фронтенд интерфейсами

### Обработка ошибок
- Централизованная обработка ошибок через middleware
- Логирование всех ошибок с контекстом
- Возврат понятных сообщений об ошибках клиенту
- Graceful degradation при недоступности внешних сервисов

### Безопасность
- Никогда не логировать чувствительные данные
- Использовать HTTPS в продакшене
- Регулярно обновлять зависимости
- Проверять входящие данные на XSS и SQL injection
- Валидировать Telegram WebApp данные

### Производительность
- Использовать индексы в базе данных
- Кэшировать часто запрашиваемые данные
- Оптимизировать N+1 запросы через Prisma include
- Использовать пагинацию для больших списков
- Сжимать ответы API (gzip)

### Тестирование
- Покрывать критический функционал unit тестами
- Тестировать API endpoints через integration тесты
- Мокать внешние сервисы в тестах
- Тестировать edge cases и error scenarios
- Тестировать совместимость с фронтенд компонентами

## Заключение

Данный план обеспечивает создание надежного и масштабируемого backend для IsmaSpace с полной интеграцией Telegram WebApp, административной панелью и системой отслеживания прогресса пользователей. Следование рекомендациям по предотвращению ошибок поможет избежать проблем, которые возникали в процессе разработки, и обеспечит стабильную работу приложения.