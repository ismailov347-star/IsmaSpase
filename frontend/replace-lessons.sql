-- Удаляем все уроки из темы 2
DELETE FROM Lesson WHERE topicId = 2;

-- Создаем новые уроки по контент-маркетингу
INSERT INTO Lesson (title, description, content, videoUrl, topicId, "order", createdAt, updatedAt) VALUES 
('Упаковка блога', 'Как оформить профиль так, чтобы подписывались и оставались. Разбираем элементы профиля, которые влияют на конверсию в подписчики.', 'В этом уроке мы детально разберем все элементы профиля в социальных сетях, которые влияют на решение пользователя подписаться на ваш аккаунт.', 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a', 2, 1, datetime('now'), datetime('now'));

INSERT INTO Lesson (title, description, content, videoUrl, topicId, "order", createdAt, updatedAt) VALUES 
('Система идей — «Контент без ступора»', 'Как генерировать идеи каждый день и не выгорать. Практические методы поиска тем для контента и систематизации идей.', 'Изучим проверенную систему генерации идей для контента, которая поможет вам никогда не сталкиваться с творческим кризисом.', 'https://www.youtube.com/embed/content-ideas-system', 2, 2, datetime('now'), datetime('now'));

INSERT INTO Lesson (title, description, content, videoUrl, topicId, "order", createdAt, updatedAt) VALUES 
('Суть текстовых рилс. Формула захвата внимания', 'Структура заголовка и подача, чтобы ролики брали охваты. Разбираем формулы вирусных текстовых рилс.', 'Разберем проверенные формулы создания текстовых рилс, которые гарантированно привлекают внимание и набирают охваты.', 'https://www.youtube.com/embed/text-reels-formula', 2, 3, datetime('now'), datetime('now'));

INSERT INTO Lesson (title, description, content, videoUrl, topicId, "order", createdAt, updatedAt) VALUES 
('Публикации-карусели — «Листай, не отпускай»', 'Сценарии, ритм и оформление каруселей, которые дочитывают. Практические советы по созданию вовлекающих каруселей.', 'Научимся создавать карусели, которые пользователи листают до конца и которые значительно повышают вовлеченность аудитории.', 'https://www.youtube.com/embed/carousel-posts-guide', 2, 4, datetime('now'), datetime('now'));