const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function replaceLessons() {
  try {
    console.log('🔍 Начинаем замену уроков в теме 2...');
    
    // Проверяем текущие уроки
    const currentLessons = await prisma.lesson.findMany({
      where: { topicId: 2 },
      orderBy: { order: 'asc' }
    });
    
    console.log(`📚 Найдено существующих уроков: ${currentLessons.length}`);
    currentLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
    });
    
    // Удаляем все уроки из темы 2
    console.log('\n🗑️ Удаляем существующие уроки...');
    const deleteResult = await prisma.lesson.deleteMany({
      where: { topicId: 2 }
    });
    console.log(`✅ Удалено уроков: ${deleteResult.count}`);
    
    // Создаем новые уроки
    console.log('\n📝 Создаем новые уроки по контент-маркетингу...');
    
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
    
    // Создаем каждый урок
    for (const lessonData of newLessons) {
      try {
        const createdLesson = await prisma.lesson.create({
          data: lessonData
        });
        console.log(`✅ Создан урок: ${createdLesson.title} (ID: ${createdLesson.id})`);
      } catch (error) {
        console.log(`❌ Ошибка создания урока "${lessonData.title}": ${error.message}`);
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
    
    console.log('\n🎉 Замена уроков успешно завершена!');
    console.log('🌐 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

replaceLessons();