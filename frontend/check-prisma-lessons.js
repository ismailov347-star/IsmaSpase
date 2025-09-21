const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPrismaLessons() {
  try {
    console.log('Проверяем уроки в Prisma базе данных...');
    
    // Получаем все уроки темы 2
    const lessons = await prisma.lesson.findMany({
      where: { topicId: 2 },
      include: {
        topic: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`Найдено уроков в Prisma: ${lessons.length}`);
    
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   TopicId: ${lesson.topicId}`);
      console.log(`   VideoUrl: ${lesson.videoUrl}`);
      console.log(`   IsLocked: ${lesson.isLocked}`);
      console.log(`   Тема: ${lesson.topic?.title}`);
      console.log('---');
    });
    
    // Также проверим все темы
    const topics = await prisma.topic.findMany({
      include: {
        lessons: true
      }
    });
    
    console.log('\nВсе темы в Prisma:');
    topics.forEach(topic => {
      console.log(`Тема ${topic.id}: ${topic.title} (${topic.lessons.length} уроков)`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrismaLessons();