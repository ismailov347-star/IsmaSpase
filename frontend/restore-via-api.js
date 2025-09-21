// Скрипт для восстановления оригинальных уроков через API

const originalLessons = [
  {
    title: "Упаковка блога",
    videoUrl: "https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a",
    topicId: 2,
    isLocked: false
  },
  {
    title: "Система идей — «Контент без ступора»",
    videoUrl: "https://www.youtube.com/embed/content-ideas-system",
    topicId: 2,
    isLocked: false
  },
  {
    title: "Суть текстовых рилс. Формула захвата внимания",
    videoUrl: "https://www.youtube.com/embed/text-reels-formula",
    topicId: 2,
    isLocked: false
  },
  {
    title: "Публикации-карусели — «Листай, не отпускай»",
    videoUrl: "https://www.youtube.com/embed/carousel-posts-guide",
    topicId: 2,
    isLocked: false
  }
];

async function restoreLessons() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🔄 Получаем текущие уроки темы 2...');
    
    // Получаем текущие уроки
    const topicResponse = await fetch(`${baseUrl}/api/topics/2`);
    if (!topicResponse.ok) {
      throw new Error(`Ошибка получения темы: ${topicResponse.status}`);
    }
    
    const topic = await topicResponse.json();
    console.log(`📚 Найдено ${topic.lessons.length} уроков для удаления`);
    
    // Удаляем существующие уроки
    for (const lesson of topic.lessons) {
      console.log(`🗑️ Удаляем урок: ${lesson.title}`);
      const deleteResponse = await fetch(`${baseUrl}/api/lessons/${lesson.id}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        console.error(`❌ Ошибка удаления урока ${lesson.id}: ${deleteResponse.status}`);
      } else {
        console.log(`✅ Урок удален: ${lesson.title}`);
      }
    }
    
    console.log('\n🔄 Добавляем оригинальные уроки...');
    
    // Добавляем новые уроки
    for (let i = 0; i < originalLessons.length; i++) {
      const lesson = originalLessons[i];
      console.log(`➕ Добавляем урок ${i + 1}: ${lesson.title}`);
      
      const createResponse = await fetch(`${baseUrl}/api/topics/2/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lesson)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`❌ Ошибка создания урока: ${createResponse.status} - ${errorText}`);
      } else {
        const createdLesson = await createResponse.json();
        console.log(`✅ Урок создан: ${createdLesson.title}`);
      }
    }
    
    console.log('\n🎉 Восстановление завершено!');
    console.log('🔗 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка восстановления:', error.message);
  }
}

// Запускаем восстановление
restoreLessons();