const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLessons() {
  try {
    console.log('Проверяем уроки в базе данных...');
    
    const lessons = await prisma.lesson.findMany({
      include: {
        topic: true
      }
    });
    
    console.log(`Найдено уроков: ${lessons.length}`);
    
    if (lessons.length > 0) {
      console.log('\nСписок уроков:');
      lessons.forEach((lesson, index) => {
        console.log(`${index + 1}. ${lesson.title}`);
        console.log(`   Тема: ${lesson.topic?.title || 'Не найдена'}`);
        console.log(`   Описание: ${lesson.description || 'Нет описания'}`);
        console.log(`   Порядок: ${lesson.order || 0}`);
        console.log('---');
      });
    } else {
      console.log('Уроки не найдены. Создаем тестовый урок...');
      
      // Найдем первую тему
      const topics = await prisma.topic.findMany();
      if (topics.length === 0) {
        console.log('Темы не найдены! Сначала создайте тему.');
        return;
      }
      
      const firstTopic = topics[0];
      console.log(`Создаем урок для темы: ${firstTopic.title}`);
      
      const newLesson = await prisma.lesson.create({
        data: {
          title: 'Тестовый урок',
          description: 'Это тестовый урок для проверки отображения',
          content: 'Содержимое тестового урока',
          topicId: firstTopic.id,
          order: 1
        }
      });
      
      console.log('Тестовый урок создан:', newLesson.title);
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessons();