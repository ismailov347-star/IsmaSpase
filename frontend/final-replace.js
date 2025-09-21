const fs = require('fs');
const path = require('path');

// Путь к базе данных SQLite
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

console.log('Начинаем замену уроков...');
console.log('Путь к базе данных:', dbPath);

// Проверяем существование базы данных
if (!fs.existsSync(dbPath)) {
  console.error('База данных не найдена:', dbPath);
  process.exit(1);
}

// Используем встроенный sqlite3 через child_process
const { execSync } = require('child_process');

try {
  // SQL команды для замены уроков
  const sqlCommands = [
    // Удаляем существующие уроки темы 2
    "DELETE FROM Lesson WHERE topicId = 2;",
    
    // Добавляем новые уроки
    `INSERT INTO Lesson (title, description, content, videoUrl, \"order\", topicId, createdAt, updatedAt) VALUES 
    ('Упаковка блога', 'Принципы эффективной упаковки блога для привлечения и удержания аудитории', 'В этом уроке мы разберем основные принципы упаковки блога: создание привлекательного дизайна, структурирование контента, оптимизация для поисковых систем и создание уникального стиля, который будет отличать ваш блог от конкурентов.', 'https://example.com/video1', 1, 2, datetime('now'), datetime('now')),
    ('Система идей — «Контент без ступора»', 'Эффективная система генерации идей для контента без творческих блоков', 'Изучите проверенную систему генерации идей для контента. Научитесь создавать контент-план на месяцы вперед, используя различные источники вдохновения и техники brainstorming. Больше никаких творческих кризисов!', 'https://example.com/video2', 2, 2, datetime('now'), datetime('now')),
    ('Суть текстовых рилс. Формула захвата внимания', 'Создание привлекательных текстовых рилс с использованием проверенных формул', 'Освойте искусство создания текстовых рилс, которые захватывают внимание с первых секунд. Изучите формулы написания цепляющих заголовков, структурирования информации и создания контента, который заставляет досматривать до конца.', 'https://example.com/video3', 3, 2, datetime('now'), datetime('now')),
    ('Публикации-карусели — «Листай, не отпускай»', 'Создание увлекательных карусельных публикаций, которые удерживают внимание', 'Научитесь создавать карусельные публикации, которые пользователи будут листать до конца. Разберем принципы storytelling в карусели, правила оформления слайдов и техники создания интриги, которая заставляет листать дальше.', 'https://example.com/video4', 4, 2, datetime('now'), datetime('now'));`
  ];
  
  // Создаем временный SQL файл
  const sqlFile = path.join(__dirname, 'temp_replace.sql');
  fs.writeFileSync(sqlFile, sqlCommands.join('\n'));
  
  console.log('Выполняем SQL команды...');
  
  // Выполняем SQL команды через sqlite3
  const command = `sqlite3 "${dbPath}" < "${sqlFile}"`;
  execSync(command, { stdio: 'inherit' });
  
  // Удаляем временный файл
  fs.unlinkSync(sqlFile);
  
  console.log('✅ Замена уроков завершена успешно!');
  
  // Проверяем результат
  console.log('\nПроверяем результат...');
  const checkCommand = `sqlite3 "${dbPath}" "SELECT id, title, \"order\" FROM Lesson WHERE topicId = 2 ORDER BY \"order\";"`;
  const result = execSync(checkCommand, { encoding: 'utf8' });
  
  if (result.trim()) {
    console.log('Новые уроки в теме:');
    const lines = result.trim().split('\n');
    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        console.log(`${index + 1}. ${parts[1]}`);
      }
    });
  } else {
    console.log('Уроки не найдены');
  }
  
} catch (error) {
  console.error('❌ Ошибка при замене уроков:', error.message);
  process.exit(1);
}