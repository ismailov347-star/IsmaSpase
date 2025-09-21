const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

function executeSQL(sql) {
  try {
    // Создаем временный SQL файл
    const tempSqlFile = path.join(__dirname, 'temp.sql');
    fs.writeFileSync(tempSqlFile, sql);
    
    // Выполняем SQL через sqlite3
    const result = execSync(`sqlite3 "${dbPath}" < "${tempSqlFile}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Удаляем временный файл
    fs.unlinkSync(tempSqlFile);
    
    return result;
  } catch (error) {
    console.error('Ошибка выполнения SQL:', error.message);
    return null;
  }
}

async function replaceLessons() {
  try {
    console.log('🔍 Начинаем замену уроков в теме 2...');
    
    // Проверяем существующие уроки
    console.log('📚 Проверяем существующие уроки...');
    const checkSQL = `SELECT id, title FROM Lesson WHERE topicId = 2 ORDER BY id;`;
    const currentLessons = executeSQL(checkSQL);
    
    if (currentLessons) {
      console.log('Текущие уроки:');
      console.log(currentLessons);
    }
    
    // Удаляем существующие уроки
    console.log('\n🗑️ Удаляем существующие уроки...');
    const deleteSQL = `DELETE FROM Lesson WHERE topicId = 2;`;
    executeSQL(deleteSQL);
    console.log('✅ Уроки удалены');
    
    // Создаем новые уроки
    console.log('\n📝 Создаем новые уроки...');
    
    const insertSQL = `
INSERT INTO Lesson (topicId, title, videoUrl, isLocked, createdAt, updatedAt) VALUES
(2, 'Упаковка блога', 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a', 0, datetime('now'), datetime('now')),
(2, 'Система идей — «Контент без ступора»', 'https://www.youtube.com/embed/content-ideas-system', 0, datetime('now'), datetime('now')),
(2, 'Суть текстовых рилс. Формула захвата внимания', 'https://www.youtube.com/embed/text-reels-formula', 0, datetime('now'), datetime('now')),
(2, 'Публикации-карусели — «Листай, не отпускай»', 'https://www.youtube.com/embed/carousel-posts-guide', 0, datetime('now'), datetime('now'));
`;
    
    executeSQL(insertSQL);
    console.log('✅ Новые уроки созданы');
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат...');
    const finalCheck = executeSQL(checkSQL);
    
    if (finalCheck) {
      console.log('Новые уроки:');
      console.log(finalCheck);
    }
    
    console.log('\n🎉 Замена уроков успешно завершена!');
    console.log('🌐 Проверьте результат: http://localhost:3000/topics/2');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

replaceLessons();