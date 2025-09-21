-- Удаляем существующие уроки темы 2
DELETE FROM lessons WHERE topic_id = 2;

-- Добавляем новые уроки по контент-маркетингу
INSERT INTO lessons (topic_id, title, video_url, order_index) VALUES
(2, 'Упаковка блога', 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a', 1),
(2, 'Система идей — «Контент без ступора»', 'https://www.youtube.com/embed/content-ideas-system', 2),
(2, 'Суть текстовых рилс. Формула захвата внимания', 'https://www.youtube.com/embed/text-reels-formula', 3),
(2, 'Публикации-карусели — «Листай, не отпускай»', 'https://www.youtube.com/embed/carousel-posts-guide', 4);

-- Проверяем результат
SELECT * FROM lessons WHERE topic_id = 2 ORDER BY order_index;