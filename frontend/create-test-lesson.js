// Простой скрипт для создания тестового урока
const fetch = require('node-fetch');

async function createTestLesson() {
  try {
    // Сначала получим список тем
    console.log('Получаем список тем...');
    const topicsResponse = await fetch('http://localhost:3000/api/topics');
    
    if (!topicsResponse.ok) {
      console.error('Ошибка получения тем:', topicsResponse.status);
      return;
    }
    
    const topics = await topicsResponse.json();
    console.log('Найдено тем:', topics.length);
    
    if (topics.length === 0) {
      console.log('Темы не найдены. Создайте сначала тему.');
      return;
    }
    
    const firstTopic = topics[0];
    console.log('Используем тему:', firstTopic.title);
    
    // Создаем урок
    console.log('Создаем тестовый урок...');
    const lessonData = {
      title: 'Тестовый урок',
      description: 'Это тестовый урок для проверки отображения в админ панели',
      content: 'Содержимое тестового урока с подробным описанием.',
      videoUrl: 'https://example.com/test-video.mp4',
      order: 1
    };
    
    const lessonResponse = await fetch(`http://localhost:3000/api/topics/${firstTopic.id}/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lessonData)
    });
    
    if (lessonResponse.ok) {
      const newLesson = await lessonResponse.json();
      console.log('Урок успешно создан:', newLesson.title);
      console.log('ID урока:', newLesson.id);
    } else {
      const error = await lessonResponse.text();
      console.error('Ошибка создания урока:', lessonResponse.status, error);
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

createTestLesson();