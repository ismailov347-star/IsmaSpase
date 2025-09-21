// Прямое восстановление уроков через Prisma Client
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreOriginalLessons() {
  try {
    console.log('🔄 Начинаем восстановление оригинальных уроков...');
    
    // Получаем текущие уроки темы 2
    const currentLessons = await prisma.lesson.findMany({
      where: { topicId: 2 },
      orderBy: { order: 'asc' }
    });
    
    console.log(`📚 Найдено текущих уроков: ${currentLessons.length}`);
    currentLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
    });
    
    // Удаляем все текущие уроки темы 2
    console.log('\n🗑️ Удаляем текущие уроки...');
    const deleteResult = await prisma.lesson.deleteMany({
      where: { topicId: 2 }
    });
    console.log(`✅ Удалено уроков: ${deleteResult.count}`);
    
    // Создаем оригинальные уроки
    console.log('\n📝 Создаем оригинальные уроки...');
    
    const originalLessons = [
      {
        title: 'Упаковка блога',
        content: 'Урок по упаковке блога для привлечения подписчиков',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        topicId: 2,
        order: 1,
        isLocked: false
      },
      {
        title: 'Система идей — «Контент без ступора»',
        content: 'Система генерации идей для постоянного создания контента',
        videoUrl: 'https://www.youtube.com/embed/content-ideas-system',
        topicId: 2,
        order: 2,
        isLocked: false
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        content: 'Создание эффективных текстовых рилс с формулой захвата внимания',
        videoUrl: 'https://www.youtube.com/embed/text-reels-formula',
        topicId: 2,
        order: 3,
        isLocked: false
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        content: 'Создание привлекательных публикаций-каруселей',
        videoUrl: 'https://www.youtube.com/embed/carousel-posts-guide',
        topicId: 2,
        order: 4,
        isLocked: false
      }
    ];
    
    for (let i = 0; i < originalLessons.length; i++) {
      const lessonData = originalLessons[i];
      
      try {
        const createdLesson = await prisma.lesson.create({
          data: lessonData
        });
        
        console.log(`✅ Создан урок ${i + 1}: ${createdLesson.title} (ID: ${createdLesson.id})`);
      } catch (error) {
        console.error(`❌ Ошибка создания урока "${lessonData.title}": ${error.message}`);
      }
    }
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат...');
    const finalLessons = await prisma.lesson.findMany({
      where: { topicId: 2 },
      orderBy: { order: 'asc' }
    });
    
    console.log(`📚 Итого уроков в теме 2: ${finalLessons.length}`);
    finalLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
    });
    
    console.log('\n🎉 Восстановление завершено успешно!');
    console.log('🌐 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка восстановления:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем восстановление
restoreOriginalLessons();