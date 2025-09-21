const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем seeding базы данных...');
  
  try {
    // Удаляем все уроки из темы 2
    console.log('🗑️ Удаляем существующие уроки темы 2...');
    await prisma.lesson.deleteMany({
      where: { topicId: 2 }
    });
    
    // Создаем новые уроки
    console.log('📝 Создаем новые уроки по контент-маркетингу...');
    
    const lessons = [
      {
        title: 'Упаковка блога',
        videoUrl: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Система идей — «Контент без ступора»',
        videoUrl: 'https://www.youtube.com/embed/content-ideas-system',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Суть текстовых рилс. Формула захвата внимания',
        videoUrl: 'https://www.youtube.com/embed/text-reels-formula',
        topicId: 2,
        isLocked: false
      },
      {
        title: 'Публикации-карусели — «Листай, не отпускай»',
        videoUrl: 'https://www.youtube.com/embed/carousel-posts-guide',
        topicId: 2,
        isLocked: false
      }
    ];
    
    for (const lesson of lessons) {
      const created = await prisma.lesson.create({
        data: lesson
      });
      console.log(`✅ Создан урок: ${created.title}`);
    }
    
    console.log('\n🎉 Seeding завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });