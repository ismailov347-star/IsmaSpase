const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Путь к базе данных
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

console.log('🔄 Начинаем замену уроков...');
console.log('📁 Путь к базе данных:', dbPath);

// Проверяем существование базы данных
if (!fs.existsSync(dbPath)) {
  console.error('❌ База данных не найдена:', dbPath);
  process.exit(1);
}

// SQL команды для замены уроков
const sqlCommands = `
-- Удаляем существующие уроки темы 2
DELETE FROM Lesson WHERE topicId = 2;

-- Добавляем новые уроки
INSERT INTO Lesson (title, description, content, videoUrl, \"order\", topicId, createdAt, updatedAt) VALUES 
('Упаковка блога', 'Принципы эффективной упаковки блога для привлечения и удержания аудитории', 'В этом уроке мы разберем основные принципы упаковки блога: создание привлекательного дизайна, структурирование контента, оптимизация для поисковых систем и создание уникального стиля, который будет отличать ваш блог от конкурентов.', 'https://example.com/video1', 1, 2, datetime('now'), datetime('now')),
('Система идей — «Контент без ступора»', 'Эффективная система генерации идей для контента без творческих блоков', 'Изучите проверенную систему генерации идей для контента. Научитесь создавать контент-план на месяцы вперед, используя различные источники вдохновения и техники brainstorming. Больше никаких творческих кризисов!', 'https://example.com/video2', 2, 2, datetime('now'), datetime('now')),
('Суть текстовых рилс. Формула захвата внимания', 'Создание привлекательных текстовых рилс с использованием проверенных формул', 'Освойте искусство создания текстовых рилс, которые захватывают внимание с первых секунд. Изучите формулы написания цепляющих заголовков, структурирования информации и создания контента, который заставляет досматривать до конца.', 'https://example.com/video3', 3, 2, datetime('now'), datetime('now')),
('Публикации-карусели — «Листай, не отпускай»', 'Создание увлекательных карусельных публикаций, которые удерживают внимание', 'Научитесь создавать карусельные публикации, которые пользователи будут листать до конца. Разберем принципы storytelling в карусели, правила оформления слайдов и техники создания интриги, которая заставляет листать дальше.', 'https://example.com/video4', 4, 2, datetime('now'), datetime('now'));
`;

// Функция для выполнения SQL команд
function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', [dbPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`SQLite error (code ${code}): ${error}`));
      }
    });
    
    child.on('error', (err) => {
      reject(new Error(`Failed to start sqlite3: ${err.message}`));
    });
    
    // Отправляем SQL команды
    child.stdin.write(sql);
    child.stdin.end();
  });
}

// Основная функция замены
async function replaceLessons() {
  try {
    console.log('⚡ Выполняем SQL команды...');
    
    // Выполняем замену
    await executeSql(sqlCommands);
    
    console.log('✅ Замена уроков завершена успешно!');
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат...');
    const checkSql = 'SELECT \"order\", title FROM Lesson WHERE topicId = 2 ORDER BY \"order\";';
    const result = await executeSql(checkSql);
    
    if (result.trim()) {
      console.log('📚 Новые уроки в теме:');
      const lines = result.trim().split('\n');
      lines.forEach((line, index) => {
        const parts = line.split('|');
        if (parts.length >= 2) {
          console.log(`   ${parts[0]}. ${parts[1]}`);
        }
      });
    } else {
      console.log('⚠️  Уроки не найдены');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при замене уроков:', error.message);
    
    // Попробуем альтернативный способ
    console.log('\n🔄 Пробуем альтернативный способ...');
    try {
      const tempFile = path.join(__dirname, 'temp.sql');
      fs.writeFileSync(tempFile, sqlCommands);
      
      const result = await executeSql(`.read ${tempFile}`);
      fs.unlinkSync(tempFile);
      
      console.log('✅ Замена выполнена альтернативным способом!');
    } catch (altError) {
      console.error('❌ Альтернативный способ также не сработал:', altError.message);
      console.log('\n💡 Попробуйте выполнить замену через Prisma Studio: http://localhost:5555');
    }
  }
}

// Запускаем замену
replaceLessons();