// Используем встроенный fetch в Node.js 18+

const API_BASE = 'http://localhost:3000/api';

async function replaceLessonsViaAPI() {
  try {
    console.log('🔍 Начинаем замену уроков через API...');
    
    // Получаем текущие уроки темы 2
    console.log('📚 Получаем текущие уроки темы 2...');
    const topicResponse = await fetch(`${API_BASE}/topics/2`);
    
    if (!topicResponse.ok) {
      throw new Error(`Ошибка получения темы: ${topicResponse.status}`);
    }
    
    const topic = await topicResponse.json();
    console.log(`Найдено уроков: ${topic.lessons.length}`);
    
    topic.lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
    });
    
    // Удаляем существующие уроки
    console.log('\n🗑️ Удаляем существующие уроки...');
    for (const lesson of topic.lessons) {
      try {
        const deleteResponse = await fetch(`${API_BASE}/lessons/${lesson.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Удален урок: ${lesson.title}`);
        } else {
          console.log(`❌ Ошибка удаления урока ${lesson.title}: ${deleteResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка удаления урока ${lesson.title}: ${error.message}`);
      }
    }
    
    // Создаем новые уроки
    console.log('\n📝 Создаем новые уроки...');
    
    const newLessons = [
      {
        title: 'Упаковка блога',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        topicId: 2
      },
      {
        title: 'Система идей — «Контент без ступора»',
        videoUrl: 'https://www.youtube.com/embed/content-ideas-system',
        topicId: 2
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        videoUrl: 'https://www.youtube.com/embed/text-reels-formula',
        topicId: 2
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        videoUrl: 'https://www.youtube.com/embed/carousel-posts-guide',
        topicId: 2
      }
    ];
    
    for (const lessonData of newLessons) {
      try {
        const createResponse = await fetch(`${API_BASE}/topics/2/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(lessonData)
        });
        
        if (createResponse.ok) {
          const createdLesson = await createResponse.json();
          console.log(`✅ Создан урок: ${createdLesson.title} (ID: ${createdLesson.id})`);
        } else {
          const errorText = await createResponse.text();
          console.log(`❌ Ошибка создания урока "${lessonData.title}": ${createResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка создания урока "${lessonData.title}": ${error.message}`);
      }
    }
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат...');
    const finalTopicResponse = await fetch(`${API_BASE}/topics/2`);
    
    if (finalTopicResponse.ok) {
      const finalTopic = await finalTopicResponse.json();
      console.log(`📚 Итого уроков в теме 2: ${finalTopic.lessons.length}`);
      finalTopic.lessons.forEach((lesson, index) => {
        console.log(`${index + 1}. ${lesson.title}`);
      });
    }
    
    console.log('\n🎉 Замена уроков успешно завершена!');
    console.log('🌐 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

replaceLessonsViaAPI();