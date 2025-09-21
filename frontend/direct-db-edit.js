// Прямое редактирование базы данных SQLite
const fs = require('fs');
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, '..', 'backend', 'database.sqlite');

console.log('🔍 Проверяем существование базы данных...');
if (!fs.existsSync(dbPath)) {
    console.log('❌ База данных не найдена по пути:', dbPath);
    process.exit(1);
}

console.log('✅ База данных найдена:', dbPath);

// Простая функция для работы с SQLite без внешних зависимостей
function executeSQL() {
    console.log('\n📝 Создаем SQL команды для замены уроков...');
    
    const sqlCommands = [
        '-- Удаляем существующие уроки темы 2',
        'DELETE FROM lessons WHERE topic_id = 2;',
        '',
        '-- Добавляем новые уроки по контент-маркетингу',
        `INSERT INTO lessons (topic_id, title, video_url, order_index) VALUES`,
        `(2, 'Упаковка блога', 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a', 1),`,
        `(2, 'Система идей — «Контент без ступора»', 'https://www.youtube.com/embed/content-ideas-system', 2),`,
        `(2, 'Суть текстовых рилс. Формула захвата внимания', 'https://www.youtube.com/embed/text-reels-formula', 3),`,
        `(2, 'Публикации-карусели — «Листай, не отпускай»', 'https://www.youtube.com/embed/carousel-posts-guide', 4);`,
        '',
        '-- Проверяем результат',
        'SELECT * FROM lessons WHERE topic_id = 2 ORDER BY order_index;'
    ];
    
    const sqlFile = path.join(__dirname, 'replace_lessons.sql');
    fs.writeFileSync(sqlFile, sqlCommands.join('\n'), 'utf8');
    
    console.log('✅ SQL файл создан:', sqlFile);
    console.log('\n📋 Содержимое SQL файла:');
    console.log('=' .repeat(50));
    console.log(sqlCommands.join('\n'));
    console.log('=' .repeat(50));
    
    console.log('\n🔧 Для выполнения команд используйте:');
    console.log('1. Откройте Prisma Studio: npx prisma studio');
    console.log('2. Или выполните SQL команды вручную в любом SQLite клиенте');
    console.log('3. Или используйте команду: sqlite3 database.sqlite < replace_lessons.sql');
    
    return sqlFile;
}

// Функция для проверки текущего состояния
function checkCurrentLessons() {
    console.log('\n🔍 Текущие уроки темы 2 (если база доступна):');
    console.log('Для проверки откройте Prisma Studio или выполните:');
    console.log('SELECT * FROM lessons WHERE topic_id = 2;');
}

// Основная функция
function main() {
    console.log('🚀 Запуск скрипта замены уроков...');
    console.log('Тема: Контент-маркетинг (ID: 2)');
    
    try {
        const sqlFile = executeSQL();
        checkCurrentLessons();
        
        console.log('\n✅ Скрипт выполнен успешно!');
        console.log('📁 SQL файл сохранен:', sqlFile);
        console.log('\n🎯 Следующие шаги:');
        console.log('1. Выполните SQL команды из созданного файла');
        console.log('2. Проверьте результат на http://localhost:3000/topics/2');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        process.exit(1);
    }
}

// Запуск
main();