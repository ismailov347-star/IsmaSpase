# PowerShell скрипт для замены уроков
$dbPath = Join-Path $PSScriptRoot "prisma\dev.db"

Write-Host "Начинаем замену уроков..." -ForegroundColor Green
Write-Host "Путь к базе данных: $dbPath"

# Проверяем существование базы данных
if (-not (Test-Path $dbPath)) {
    Write-Host "База данных не найдена: $dbPath" -ForegroundColor Red
    exit 1
}

# SQL команды
$sqlCommands = @"
DELETE FROM Lesson WHERE topicId = 2;

INSERT INTO Lesson (title, description, content, videoUrl, "order", topicId, createdAt, updatedAt) VALUES 
('Упаковка блога', 'Принципы эффективной упаковки блога для привлечения и удержания аудитории', 'В этом уроке мы разберем основные принципы упаковки блога: создание привлекательного дизайна, структурирование контента, оптимизация для поисковых систем и создание уникального стиля, который будет отличать ваш блог от конкурентов.', 'https://example.com/video1', 1, 2, datetime('now'), datetime('now')),
('Система идей — «Контент без ступора»', 'Эффективная система генерации идей для контента без творческих блоков', 'Изучите проверенную систему генерации идей для контента. Научитесь создавать контент-план на месяцы вперед, используя различные источники вдохновения и техники brainstorming. Больше никаких творческих кризисов!', 'https://example.com/video2', 2, 2, datetime('now'), datetime('now')),
('Суть текстовых рилс. Формула захвата внимания', 'Создание привлекательных текстовых рилс с использованием проверенных формул', 'Освойте искусство создания текстовых рилс, которые захватывают внимание с первых секунд. Изучите формулы написания цепляющих заголовков, структурирования информации и создания контента, который заставляет досматривать до конца.', 'https://example.com/video3', 3, 2, datetime('now'), datetime('now')),
('Публикации-карусели — «Листай, не отпускай»', 'Создание увлекательных карусельных публикаций, которые удерживают внимание', 'Научитесь создавать карусельные публикации, которые пользователи будут листать до конца. Разберем принципы storytelling в карусели, правила оформления слайдов и техники создания интриги, которая заставляет листать дальше.', 'https://example.com/video4', 4, 2, datetime('now'), datetime('now'));
"@

# Создаем временный SQL файл
$tempSqlFile = Join-Path $PSScriptRoot "temp_replace.sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    Write-Host "Выполняем SQL команды..." -ForegroundColor Yellow
    
    # Выполняем SQL команды
    $result = & sqlite3 $dbPath ".read $tempSqlFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Замена уроков завершена успешно!" -ForegroundColor Green
        
        # Проверяем результат
        Write-Host "`nПроверяем результат..." -ForegroundColor Yellow
        $checkResult = & sqlite3 $dbPath "SELECT id, title, `"order`" FROM Lesson WHERE topicId = 2 ORDER BY `"order`";"
        
        if ($checkResult) {
            Write-Host "Новые уроки в теме:" -ForegroundColor Green
            $lines = $checkResult -split "`n"
            for ($i = 0; $i -lt $lines.Count; $i++) {
                $parts = $lines[$i] -split "\|"
                if ($parts.Count -ge 2) {
                    Write-Host "$($i + 1). $($parts[1])" -ForegroundColor Cyan
                }
            }
        } else {
            Write-Host "Уроки не найдены" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Ошибка при выполнении SQL команд" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Удаляем временный файл
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

Write-Host "`nНажмите любую клавишу для продолжения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")