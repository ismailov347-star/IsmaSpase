const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Пути к файлам
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const sqlFile = path.join(__dirname, 'replace_lessons.sql');

console.log('🔄 Начинаю замену уроков в базе данных...');

// Проверяем существование файлов
if (!fs.existsSync(dbPath)) {
    console.error('❌ Ошибка: База данных не найдена по пути:', dbPath);
    process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
    console.error('❌ Ошибка: SQL файл не найден по пути:', sqlFile);
    process.exit(1);
}

try {
    // Открываем базу данных
    const db = new Database(dbPath);
    
    console.log('✅ База данных подключена успешно');
    
    // Читаем SQL команды из файла
    const sqlCommands = fs.readFileSync(sqlFile, 'utf8');
    
    // Разделяем команды по точке с запятой
    const commands = sqlCommands.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`📝 Найдено ${commands.length} SQL команд для выполнения`);
    
    // Выполняем каждую команду
    db.transaction(() => {
        commands.forEach((command, index) => {
            const trimmedCommand = command.trim();
            if (trimmedCommand) {
                console.log(`⚡ Выполняю команду ${index + 1}: ${trimmedCommand.substring(0, 50)}...`);
                db.exec(trimmedCommand);
            }
        });
    })();
    
    console.log('✅ Все SQL команды выполнены успешно!');
    
    // Проверяем результат
    const lessons = db.prepare('SELECT * FROM Lesson WHERE topicId = 2').all();
    console.log(`\n📊 Результат: найдено ${lessons.length} уроков для темы "Контент-маркетинг"`);
    
    lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title}`);
    });
    
    db.close();
    
    console.log('\n🎉 Замена уроков завершена успешно!');
    console.log('🌐 Проверьте результат на странице: http://localhost:3000/topics/2');
    
} catch (error) {
    console.error('❌ Ошибка при выполнении замены:', error.message);
    process.exit(1);
}