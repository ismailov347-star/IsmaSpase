const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Новые уроки для темы "Контент-маркетинг"
const newLessons = [
  {
    title: "Основы контент-маркетинга",
    description: "Изучите фундаментальные принципы создания и распространения ценного контента для привлечения и удержания аудитории.",
    content: "Контент-маркетинг — это стратегический подход к маркетингу, направленный на создание и распространение ценного, релевантного и последовательного контента для привлечения и удержания четко определенной аудитории.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 1,
    topicId: 2
  },
  {
    title: "Стратегия контент-маркетинга",
    description: "Научитесь разрабатывать эффективную стратегию контент-маркетинга, определять цели и KPI.",
    content: "Эффективная стратегия контент-маркетинга начинается с четкого понимания ваших бизнес-целей, целевой аудитории и уникального ценностного предложения.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 2,
    topicId: 2
  },
  {
    title: "Создание качественного контента",
    description: "Освойте принципы создания контента, который привлекает внимание и приносит результат.",
    content: "Качественный контент должен быть полезным, интересным, релевантным для аудитории и соответствовать целям бренда.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 3,
    topicId: 2
  },
  {
    title: "Распространение и продвижение контента",
    description: "Изучите каналы и методы эффективного распространения контента для максимального охвата аудитории.",
    content: "Создание отличного контента — это только половина успеха. Важно знать, как правильно его распространять через различные каналы.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 4,
    topicId: 2
  },
  {
    title: "Аналитика и оптимизация контента",
    description: "Научитесь измерять эффективность контент-маркетинга и оптимизировать стратегию на основе данных.",
    content: "Регулярный анализ метрик позволяет понять, какой контент работает лучше всего, и корректировать стратегию для достижения лучших результатов.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 5,
    topicId: 2
  }
];

async function replaceLessons() {
  try {
    console.log('🔄 Начинаю замену уроков через Prisma Client...');
    
    // Удаляем существующие уроки для темы 2
    console.log('🗑️ Удаляю существующие уроки для темы "Контент-маркетинг"...');
    const deletedLessons = await prisma.lesson.deleteMany({
      where: {
        topicId: 2
      }
    });
    
    console.log(`✅ Удалено ${deletedLessons.count} уроков`);
    
    // Добавляем новые уроки
    console.log('➕ Добавляю новые уроки...');
    
    for (const lesson of newLessons) {
      const createdLesson = await prisma.lesson.create({
        data: lesson
      });
      console.log(`   ✅ Создан урок: "${createdLesson.title}"`);
    }
    
    // Проверяем результат
    const finalLessons = await prisma.lesson.findMany({
      where: {
        topicId: 2
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    console.log(`\n📊 Результат: создано ${finalLessons.length} новых уроков для темы "Контент-маркетинг"`);
    
    finalLessons.forEach((lesson, index) => {
      console.log(`   ${index + 1}. ${lesson.title}`);
    });
    
    console.log('\n🎉 Замена уроков завершена успешно!');
    console.log('🌐 Проверьте результат на странице: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка при замене уроков:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем функцию замены
replaceLessons();