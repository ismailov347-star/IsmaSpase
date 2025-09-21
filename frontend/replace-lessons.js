const API_BASE_URL = 'http://localhost:3000';

async function replaceLessonsInTopic2() {
  try {
    // Сначала получаем все уроки в теме 2
    const response = await fetch(`${API_BASE_URL}/api/lessons?topicId=2`);
    const existingLessons = await response.json();
    
    console.log('Найдено существующих уроков:', existingLessons.length);
    
    // Удаляем все существующие уроки
    for (const lesson of existingLessons) {
      const deleteResponse = await fetch(`${API_BASE_URL}/api/lessons/${lesson.id}`, {
        method: 'DELETE'
      });
      if (deleteResponse.ok) {
        console.log(`Удален урок: ${lesson.title}`);
      }
    }
    
    // Создаем новые уроки
    const newLessons = [
      {
        title: 'Упаковка блога',
        description: 'Как оформить профиль так, чтобы подписывались и оставались. Разбираем элементы профиля, которые влияют на конверсию в подписчики.',
        videoUrl: 'https://example.com/video1.mp4',
        topicId: 2,
        order: 1
      },
      {
        title: 'Система идей — «Контент без ступора»',
        description: 'Как генерировать идеи каждый день и не выгорать. Практические методы поиска тем для контента и систематизации идей.',
        videoUrl: 'https://example.com/video2.mp4',
        topicId: 2,
        order: 2
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        description: 'Структура заголовка и подача, чтобы ролики брали охваты. Разбираем формулы вирусных текстовых рилс.',
        videoUrl: 'https://example.com/video3.mp4',
        topicId: 2,
        order: 3
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        description: 'Сценарии, ритм и оформление каруселей, которые дочитывают. Практические советы по созданию вовлекающих каруселей.',
        videoUrl: 'https://example.com/video4.mp4',
        topicId: 2,
        order: 4
      }
    ];
    
    // Создаем каждый урок
    for (const lesson of newLessons) {
      const createResponse = await fetch(`${API_BASE_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lesson)
      });
      
      if (createResponse.ok) {
        const createdLesson = await createResponse.json();
        console.log(`Создан урок: ${createdLesson.title}`);
      } else {
        console.error(`Ошибка создания урока ${lesson.title}:`, await createResponse.text());
      }
    }
    
    console.log('\nВсе уроки успешно заменены!');
    console.log('Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('Ошибка при замене уроков:', error);
  }
}

replaceLessonsInTopic2();}}}