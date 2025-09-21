@echo off
echo Замена уроков темы "Контент-маркетинг"
echo.

echo Шаг 1: Получаем текущие уроки темы 2...
curl -X GET "http://localhost:3001/api/topics/2" -H "Content-Type: application/json"
echo.
echo.

echo Шаг 2: Удаляем существующие уроки...
echo Удаляем урок с ID 3...
curl -X DELETE "http://localhost:3001/api/lessons/3"
echo.
echo Удаляем урок с ID 4...
curl -X DELETE "http://localhost:3001/api/lessons/4"
echo.
echo Удаляем урок с ID 5...
curl -X DELETE "http://localhost:3001/api/lessons/5"
echo.
echo Удаляем урок с ID 6...
curl -X DELETE "http://localhost:3001/api/lessons/6"
echo.
echo.

echo Шаг 3: Добавляем новые уроки по контент-маркетингу...
echo.

echo Добавляем урок 1: Упаковка блога...
curl -X POST "http://localhost:3001/api/topics/2/lessons" -H "Content-Type: application/json" -d "{\"title\":\"Упаковка блога\",\"videoUrl\":\"https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a\",\"topicId\":2,\"isLocked\":false}"
echo.
echo.

echo Добавляем урок 2: Система идей...
curl -X POST "http://localhost:3001/api/topics/2/lessons" -H "Content-Type: application/json" -d "{\"title\":\"Система идей — «Контент без ступора»\",\"videoUrl\":\"https://www.youtube.com/embed/content-ideas-system\",\"topicId\":2,\"isLocked\":false}"
echo.
echo.

echo Добавляем урок 3: Суть текстовых рилс...
curl -X POST "http://localhost:3001/api/topics/2/lessons" -H "Content-Type: application/json" -d "{\"title\":\"Суть текстовых рилс. Формула захвата внимания\",\"videoUrl\":\"https://www.youtube.com/embed/text-reels-formula\",\"topicId\":2,\"isLocked\":false}"
echo.
echo.

echo Добавляем урок 4: Публикации-карусели...
curl -X POST "http://localhost:3001/api/topics/2/lessons" -H "Content-Type: application/json" -d "{\"title\":\"Публикации-карусели — «Листай, не отпускай»\",\"videoUrl\":\"https://www.youtube.com/embed/carousel-posts-guide\",\"topicId\":2,\"isLocked\":false}"
echo.
echo.

echo Шаг 4: Проверяем результат...
curl -X GET "http://localhost:3001/api/topics/2" -H "Content-Type: application/json"
echo.
echo.

echo Готово! Проверьте результат на странице: http://localhost:3000/topics/2
pause