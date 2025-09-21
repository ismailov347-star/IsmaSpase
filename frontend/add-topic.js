const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTopic() {
  try {
    const topic = await prisma.topic.create({
      data: {
        title: "Практикум 'Система легкого контента'",
        description: "Короткая, понятная система для роста блога и стабильного контента. Изучите основы создания качественного контента, который привлекает аудиторию и помогает развивать ваш блог.",
        isLocked: false
      }
    });
    
    console.log('Тема успешно создана:', topic);
    
    // Добавим несколько уроков для этой темы
    const lessons = [
      {
        title: "Введение в систему легкого контента",
        topicId: topic.id,
        videoUrl: "https://www.youtube.com/watch?v=example1",
        isLocked: false
      },
      {
        title: "Планирование контент-стратегии",
        topicId: topic.id,
        videoUrl: "https://www.youtube.com/watch?v=example2",
        isLocked: false
      },
      {
        title: "Создание привлекательных заголовков",
        topicId: topic.id,
        videoUrl: "https://www.youtube.com/watch?v=example3",
        isLocked: false
      }
    ];
    
    for (const lessonData of lessons) {
      const lesson = await prisma.lesson.create({
        data: lessonData
      });
      console.log('Урок создан:', lesson.title);
    }
    
  } catch (error) {
    console.error('Ошибка при создании темы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTopic();