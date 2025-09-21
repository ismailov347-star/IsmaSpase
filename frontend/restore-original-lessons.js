const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreOriginalLessons() {
  try {
    // Удаляем текущие уроки темы 2
    await prisma.lesson.deleteMany({
      where: { topicId: 2 }
    });

    // Создаем оригинальные уроки
    const originalLessons = [
      {
        title: "Упаковка блога",
        content: "Урок по упаковке блога",
        videoUrl: "/videos/lesson1.mp4",
        topicId: 2,
        order: 1
      },
      {
        title: "Система идей — «Контент без ступора»",
        content: "Урок по системе идей для создания контента",
        videoUrl: "/videos/lesson2.mp4",
        topicId: 2,
        order: 2
      },
      {
        title: "Суть текстовых рилс. Формула захвата внимания",
        content: "Урок по созданию текстовых рилс",
        videoUrl: "/videos/lesson3.mp4",
        topicId: 2,
        order: 3
      },
      {
        title: "Публикации-карусели — «Листай, не отпускай»",
        content: "Урок по созданию публикаций-каруселей",
        videoUrl: "/videos/lesson4.mp4",
        topicId: 2,
        order: 4
      }
    ];

    for (const lesson of originalLessons) {
      await prisma.lesson.create({
        data: lesson
      });
    }

    console.log('Оригинальные уроки успешно восстановлены!');
    
    // Проверяем результат
    const restoredLessons = await prisma.lesson.findMany({
      where: { topicId: 2 },
      orderBy: { order: 'asc' }
    });
    
    console.log('Восстановленные уроки:');
    restoredLessons.forEach(lesson => {
      console.log(`${lesson.order}. ${lesson.title}`);
    });
    
  } catch (error) {
    console.error('Ошибка при восстановлении уроков:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreOriginalLessons();