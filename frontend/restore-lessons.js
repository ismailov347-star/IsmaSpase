const fetch = require('node-fetch');

async function restoreLessonsToTopic2() {
  try {
    console.log('Восстанавливаем уроки в тему с ID 2...');
    
    const topicId = 2;
    
    // Определяем уроки для темы ID 2
    const lessons = [
      {
        title: 'Упаковка блога',
        description: 'как оформить профиль так, чтобы подписывались и оставались.',
        content: 'В этом уроке разберем принципы оформления профиля, которые привлекают подписчиков и удерживают их внимание.',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        topicId: topicId,
        order: 1
      },
      {
        title: 'Система идей — «Контент без ступора»',
        description: 'как генерировать идеи каждый день и не выгорать.',
        content: 'Изучим систему генерации идей для контента, которая поможет избежать творческого кризиса.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        topicId: topicId,
        order: 2
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        description: 'структура заголовка и подача, чтобы ролики брали охваты.',
        content: 'Разберем формулы создания цепляющих заголовков и структуру текстовых рилс для максимального охвата.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        topicId: topicId,
        order: 3
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        description: 'сценарии, ритм и оформление каруселей, которые дочитывают.',
        content: 'Изучим принципы создания каруселей, которые удерживают внимание пользователей до последнего слайда.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        topicId: topicId,
        order: 4
      }
    ];
    
    console.log('Создаем уроки...');
    
    for (const lessonData of lessons) {
      try {
        const response = await fetch('http://localhost:3000/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(lessonData)
        });
        
        if (response.ok) {
          const lesson = await response.json();
          console.log(`✓ Создан урок: ${lesson.title}`);
        } else {
          const error = await response.text();
          console.log(`✗ Ошибка создания урока "${lessonData.title}": ${error}`);
        }
      } catch (error) {
        console.log(`✗ Ошибка создания урока "${lessonData.title}": ${error.message}`);
      }
    }
    
    console.log('\nВсе уроки обработаны! Проверьте http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('Общая ошибка:', error.message);
  }
}

restoreLessonsToTopic2();