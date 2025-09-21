const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Новые уроки для замены
const newLessons = [
  {
    title: 'Упаковка блога',
    description: 'Принципы эффективной упаковки блога для привлечения и удержания аудитории',
    content: 'В этом уроке мы разберем основные принципы упаковки блога: создание привлекательного дизайна, структурирование контента, оптимизация для поисковых систем и создание уникального стиля, который будет отличать ваш блог от конкурентов.',
    videoUrl: 'https://example.com/video1',
    order: 1,
    topicId: 2
  },
  {
    title: 'Система идей — «Контент без ступора»',
    description: 'Эффективная система генерации идей для контента без творческих блоков',
    content: 'Изучите проверенную систему генерации идей для контента. Научитесь создавать контент-план на месяцы вперед, используя различные источники вдохновения и техники brainstorming. Больше никаких творческих кризисов!',
    videoUrl: 'https://example.com/video2',
    order: 2,
    topicId: 2
  },
  {
    title: 'Суть текстовых рилс. Формула захвата внимания',
    description: 'Создание привлекательных текстовых рилс с использованием проверенных формул',
    content: 'Освойте искусство создания текстовых рилс, которые захватывают внимание с первых секунд. Изучите формулы написания цепляющих заголовков, структурирования информации и создания контента, который заставляет досматривать до конца.',
    videoUrl: 'https://example.com/video3',
    order: 3,
    topicId: 2
  },
  {
    title: 'Публикации-карусели — «Листай, не отпускай»',
    description: 'Создание увлекательных карусельных публикаций, которые удерживают внимание',
    content: 'Научитесь создавать карусельные публикации, которые пользователи будут листать до конца. Разберем принципы storytelling в карусели, правила оформления слайдов и техники создания интриги, которая заставляет листать дальше.',
    videoUrl: 'https://example.com/video4',
    order: 4,
    topicId: 2
  }
];

async function replaceLessons() {
  try {
    console.log('Начинаем замену уроков через API...');
    
    // Получаем существующие уроки темы 2
    console.log('Получаем существующие уроки...');
    const response = await fetch(`${API_BASE}/topics/2/lessons`);
    
    if (!response.ok) {
      throw new Error(`Ошибка получения уроков: ${response.status}`);
    }
    
    const existingLessons = await response.json();
    console.log(`Найдено существующих уроков: ${existingLessons.length}`);
    
    // Удаляем существующие уроки
    for (const lesson of existingLessons) {
      console.log(`Удаляем урок: ${lesson.title}`);
      const deleteResponse = await fetch(`${API_BASE}/lessons/${lesson.id}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        console.error(`Ошибка удаления урока ${lesson.id}: ${deleteResponse.status}`);
      } else {
        console.log(`Урок "${lesson.title}" удален`);
      }
    }
    
    // Добавляем новые уроки
    console.log('\nДобавляем новые уроки...');
    for (const lesson of newLessons) {
      console.log(`Добавляем урок: ${lesson.title}`);
      const createResponse = await fetch(`${API_BASE}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lesson)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`Ошибка создания урока "${lesson.title}": ${createResponse.status} - ${errorText}`);
      } else {
        const createdLesson = await createResponse.json();
        console.log(`Урок "${lesson.title}" создан с ID: ${createdLesson.id}`);
      }
    }
    
    // Проверяем результат
    console.log('\nПроверяем результат...');
    const finalResponse = await fetch(`${API_BASE}/topics/2/lessons`);
    if (finalResponse.ok) {
      const finalLessons = await finalResponse.json();
      console.log('\nНовые уроки в теме:');
      finalLessons.forEach(lesson => {
        console.log(`${lesson.order}. ${lesson.title}`);
      });
    }
    
    console.log('\n✅ Замена уроков завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при замене уроков:', error.message);
  }
}

// Запускаем замену
replaceLessons();