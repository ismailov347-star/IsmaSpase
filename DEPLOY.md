# 🚀 Автоматический деплой на Vercel

Этот проект настроен для автоматического деплоя на Vercel через GitHub Actions.

## Настройка автоматического деплоя

### 1. Создание проекта на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub аккаунт
3. Нажмите "New Project"
4. Импортируйте ваш GitHub репозиторий
5. Установите следующие настройки:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Получение токенов Vercel

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Откройте **Settings** → **Tokens**
3. Создайте новый токен с именем "GitHub Actions"
4. Скопируйте токен (сохраните его безопасно)

### 3. Получение ID проекта и организации

1. Откройте ваш проект в Vercel Dashboard
2. Перейдите в **Settings** → **General**
3. Скопируйте:
   - **Project ID**
   - **Team ID** (или **Personal Account ID**)

### 4. Настройка GitHub Secrets

1. Перейдите в ваш GitHub репозиторий
2. Откройте **Settings** → **Secrets and variables** → **Actions**
3. Добавьте следующие секреты:

```
VERCEL_TOKEN=ваш_токен_vercel
ORG_ID=ваш_team_id_или_personal_id
PROJECT_ID=ваш_project_id
```

### 5. Автоматический деплой

Теперь при каждом пуше в ветку `main`:

✅ **Автоматически запустится GitHub Action**  
✅ **Установятся зависимости**  
✅ **Соберется приложение**  
✅ **Задеплоится на Vercel**  
✅ **Получите ссылку на новую версию**  

### 6. Мониторинг деплоя

- **GitHub Actions**: Вкладка "Actions" в репозитории
- **Vercel Dashboard**: Вкладка "Deployments" в проекте
- **Уведомления**: Автоматические уведомления в GitHub

## Структура деплоя

```
GitHub Push → GitHub Actions → Build → Vercel Deploy → Live URL
```

## Полезные команды

```bash
# Локальная сборка
cd frontend && npm run build

# Локальный деплой на Vercel
npx vercel --prod

# Просмотр логов деплоя
npx vercel logs
```

## Troubleshooting

- Проверьте правильность секретов в GitHub
- Убедитесь, что Vercel проект настроен корректно
- Проверьте логи в GitHub Actions
- Убедитесь, что `frontend/package.json` содержит все зависимости

---

🎉 **Готово!** Теперь ваше приложение будет автоматически деплоиться при каждом обновлении кода!