const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function replaceLessons() {
  try {
    console.log('🔄 Начинаем замену уроков через Prisma...');
    
    // Удаляем существующие уроки темы 2
    console.log('🗑️ Удаляем существующие уроки темы 2...');
    const deleteResult = await prisma.lesson.deleteMany({
      where: {
        topicId: 2
      }
    });
    console.log(`✅ Удалено уроков: ${deleteResult.count}`);
    
    // Добавляем новые уроки
    console.log('➕ Добавляем новые уроки...');
    
    const newLessons = [
      {
        title: 'Упаковка блога',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Система идей — «Контент без ступора»',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555b',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555c',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555d',
        topicId: 2,
        isLocked: false
      }
    ];
    
    // Создаем уроки по одному
    for (const lessonData of newLessons) {
      const lesson = await prisma.lesson.create({
        data: lessonData
      });
      console.log(`✅ Создан урок: ${lesson.title}`);
    }
    
    console.log('\n🎉 Замена уроков завершена успешно!');
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат...');
    const lessons = await prisma.lesson.findMany({
      where: {
        topicId: 2
      },
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true,
        title: true
      }
    });
    
    console.log('📚 Новые уроки в теме:');
    lessons.forEach((lesson, index) => {
      console.log(`   ${index + 1}. ${lesson.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при замене уроков:', error.message);
    console.error('Детали ошибки:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем замену
replaceLessons();