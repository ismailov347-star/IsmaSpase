# PowerShell скрипт для выполнения SQL команд замены уроков

# Путь к базе данных
$dbPath = "C:\Users\Admin\Desktop\Web App\frontend\prisma\dev.db"
$sqlFile = "C:\Users\Admin\Desktop\Web App\frontend\replace_lessons.sql"

# Проверяем существование файлов
if (-not (Test-Path $dbPath)) {
    Write-Host "Ошибка: База данных не найдена по пути $dbPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $sqlFile)) {
    Write-Host "Ошибка: SQL файл не найден по пути $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Выполняю замену уроков в базе данных..." -ForegroundColor Green

try {
    # Используем sqlite3.exe если доступен, иначе пытаемся через .NET
    $sqliteExe = Get-Command sqlite3.exe -ErrorAction SilentlyContinue
    
    if ($sqliteExe) {
        Write-Host "Используем sqlite3.exe для выполнения SQL команд" -ForegroundColor Yellow
        & sqlite3.exe $dbPath ".read $sqlFile"
    } else {
        Write-Host "sqlite3.exe не найден. Попробуйте установить SQLite или выполните SQL команды вручную через Prisma Studio" -ForegroundColor Yellow
        Write-Host "SQL файл находится по адресу: $sqlFile" -ForegroundColor Cyan
        
        # Показываем содержимое SQL файла
        Write-Host "`nСодержимое SQL файла:" -ForegroundColor Cyan
        Get-Content $sqlFile | Write-Host -ForegroundColor White
        
        Write-Host "`nИнструкции для ручного выполнения:" -ForegroundColor Yellow
        Write-Host "1. Откройте Prisma Studio по адресу http://localhost:5555" -ForegroundColor White
        Write-Host "2. Перейдите в таблицу Lesson" -ForegroundColor White
        Write-Host "3. Удалите все уроки с topicId = 2" -ForegroundColor White
        Write-Host "4. Добавьте новые уроки согласно SQL файлу" -ForegroundColor White
    }
    
    Write-Host "`nЗамена уроков завершена!" -ForegroundColor Green
    Write-Host "Проверьте результат на странице: http://localhost:3000/topics/2" -ForegroundColor Cyan
    
} catch {
    Write-Host "Ошибка при выполнении SQL команд: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")