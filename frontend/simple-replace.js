const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Четыре новых урока для темы "Контент-маркетинг"
const newLessons = [
  {
    title: "Упаковка блога",
    description: "Изучите принципы эффективной упаковки блога для привлечения и удержания читателей.",
    content: "Правильная упаковка блога включает в себя создание привлекательного дизайна, структурирование контента и оптимизацию пользовательского опыта.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 1,
    topicId: 2
  },
  {
    title: "Система идей — «Контент без ступора»",
    description: "Освойте систему генерации идей для создания контента без творческих блоков.",
    content: "Эффективная система идей помогает постоянно генерировать свежий и интересный контент, избегая творческого ступора.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 2,
    topicId: 2
  },
  {
    title: "Суть текстовых рилс. Формула захвата внимания",
    description: "Изучите формулу создания текстовых рилс, которые захватывают внимание аудитории.",
    content: "Текстовые рилс требуют особого подхода к созданию контента, который мгновенно привлекает внимание и удерживает зрителя.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 3,
    topicId: 2
  },
  {
    title: "Публикации-карусели — «Листай, не отпускай»",
    description: "Научитесь создавать увлекательные публикации-карусели, которые заставляют пользователей листать до конца.",
    content: "Карусельные публикации — мощный инструмент для удержания внимания и передачи большого объема информации в интерактивном формате.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 4,
    topicId: 2
  }
];

async function replaceSimple() {
  try {
    console.log('🔄 Заменяю уроки на новые...');
    
    // Удаляем все уроки для темы 2
    await prisma.lesson.deleteMany({
      where: { topicId: 2 }
    });
    console.log('✅ Старые уроки удалены');
    
    // Добавляем новые уроки
    for (const lesson of newLessons) {
      await prisma.lesson.create({ data: lesson });
      console.log(`✅ Добавлен: ${lesson.title}`);
    }
    
    console.log('🎉 Замена завершена! Проверьте: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

replaceSimple();