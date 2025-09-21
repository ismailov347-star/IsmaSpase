const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

console.log('Подключение к базе данных:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Подключение к SQLite базе данных успешно.');
});

// Функция для выполнения SQL запроса
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes, lastID: this.lastID });
      }
    });
  });
}

// Функция для получения данных
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function replaceLessons() {
  try {
    console.log('Начинаем замену уроков...');
    
    // Проверяем существующие уроки
    const existingLessons = await getQuery('SELECT * FROM Lesson WHERE topicId = 2');
    console.log('Найдено существующих уроков:', existingLessons.length);
    
    // Удаляем существующие уроки темы 2
    const deleteResult = await runQuery('DELETE FROM Lesson WHERE topicId = 2');
    console.log('Удалено уроков:', deleteResult.changes);
    
    // Новые уроки
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
    
    // Добавляем новые уроки
    for (const lesson of newLessons) {
      const result = await runQuery(
        'INSERT INTO Lesson (title, description, content, videoUrl, "order", topicId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [lesson.title, lesson.description, lesson.content, lesson.videoUrl, lesson.order, lesson.topicId]
      );
      console.log(`Добавлен урок "${lesson.title}" с ID:`, result.lastID);
    }
    
    // Проверяем результат
    const newLessonsCheck = await getQuery('SELECT * FROM Lesson WHERE topicId = 2 ORDER BY "order"');
    console.log('\nНовые уроки в базе данных:');
    newLessonsCheck.forEach(lesson => {
      console.log(`${lesson.order}. ${lesson.title}`);
    });
    
    console.log('\nЗамена уроков завершена успешно!');
    
  } catch (error) {
    console.error('Ошибка при замене уроков:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии базы данных:', err.message);
      } else {
        console.log('Соединение с базой данных закрыто.');
      }
    });
  }
}

// Запускаем замену
replaceLessons();