const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔍 Проверка состояния баз данных SQLite\n');

// Проверка backend базы данных
const backendDbPath = path.join(__dirname, 'database.sqlite');
console.log('📊 Backend база данных:', backendDbPath);

if (fs.existsSync(backendDbPath)) {
  console.log('✅ Файл существует');
  
  const backendDb = new sqlite3.Database(backendDbPath, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к backend БД:', err.message);
    } else {
      console.log('✅ Подключение к backend БД успешно');
      
      // Получаем список таблиц
      backendDb.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('❌ Ошибка получения таблиц:', err.message);
        } else {
          console.log('📋 Таблицы в backend БД:', tables.map(t => t.name));
          
          // Проверяем количество записей в основных таблицах
          const checkTable = (tableName) => {
            backendDb.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
              if (err) {
                console.log(`❌ Ошибка проверки таблицы ${tableName}:`, err.message);
              } else {
                console.log(`📊 ${tableName}: ${row.count} записей`);
              }
            });
          };
          
          if (tables.some(t => t.name === 'users')) checkTable('users');
          if (tables.some(t => t.name === 'topics')) checkTable('topics');
          if (tables.some(t => t.name === 'lessons')) checkTable('lessons');
        }
        
        backendDb.close();
      });
    }
  });
} else {
  console.log('❌ Файл не существует');
}

console.log('\n' + '='.repeat(50) + '\n');

// Проверка frontend базы данных (Prisma)
const frontendDbPath = path.join(__dirname, '..', 'frontend', 'prisma', 'dev.db');
console.log('📊 Frontend база данных (Prisma):', frontendDbPath);

if (fs.existsSync(frontendDbPath)) {
  console.log('✅ Файл существует');
  
  const frontendDb = new sqlite3.Database(frontendDbPath, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к frontend БД:', err.message);
    } else {
      console.log('✅ Подключение к frontend БД успешно');
      
      // Получаем список таблиц
      frontendDb.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('❌ Ошибка получения таблиц:', err.message);
        } else {
          console.log('📋 Таблицы в frontend БД:', tables.map(t => t.name));
          
          // Проверяем количество записей в основных таблицах
          const checkTable = (tableName) => {
            frontendDb.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
              if (err) {
                console.log(`❌ Ошибка проверки таблицы ${tableName}:`, err.message);
              } else {
                console.log(`📊 ${tableName}: ${row.count} записей`);
              }
            });
          };
          
          if (tables.some(t => t.name === 'Topic')) checkTable('Topic');
          if (tables.some(t => t.name === 'Lesson')) checkTable('Lesson');
          if (tables.some(t => t.name === 'Tip')) checkTable('Tip');
          if (tables.some(t => t.name === 'Material')) checkTable('Material');
        }
        
        frontendDb.close();
      });
    }
  });
} else {
  console.log('❌ Файл не существует');
}

console.log('\n🔧 Статус серверов:');
console.log('- Frontend: http://localhost:3000 (Next.js)');
console.log('- Backend: http://localhost:3002 (Express.js)');
console.log('\n💡 Для управления Prisma БД используйте:');
console.log('- npx prisma studio (в папке frontend)');
console.log('- npx prisma migrate dev (для миграций)');