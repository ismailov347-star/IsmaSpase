const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Инициализация базы данных
const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Создание таблиц при запуске
db.serialize(() => {
  // Таблица тем
  db.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Таблица уроков
  db.run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics (id)
    )
  `)

  // Таблица прогресса пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default_user',
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id),
      UNIQUE(user_id, lesson_id)
    )
  `)

  // Добавляем тестовые данные если таблицы пустые
  db.get("SELECT COUNT(*) as count FROM topics", (err, row) => {
    if (row.count === 0) {
      // Добавляем тестовые темы
      const topics = [
        { title: 'Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»', description: 'Короткая, понятная система для роста блога и стабильного контента.' },
        { title: 'Web-разработка', description: 'Создание современных веб-приложений' },
        { title: 'Базы данных', description: 'Работа с базами данных и SQL' },
        { title: 'Основы программирования', description: 'Изучите основные концепции программирования' }
      ]

      topics.forEach((topic, index) => {
        db.run(
          "INSERT INTO topics (title, description) VALUES (?, ?)",
          [topic.title, topic.description],
          function(err) {
            if (err) {
              console.error('Ошибка добавления темы:', err)
              return
            }
            
            // Добавляем уроки для каждой темы
            const topicId = this.lastID
            let lessons = []
            
            if (index === 0) { // Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА» - 4 урока
              lessons = [
                {
                  title: 'УПАКОВКА БЛОГА',
                  description: 'как оформить профиль так, чтобы подписывались и оставались.',
                  video_url: 'https://miro.com/app/board/uXjVJRG4MJs=/?playRecording=67075cf5-24c9-4ecb-8edd-9738c2c9555a'
                },
                {
                  title: 'СИСТЕМА ИДЕЙ «КОНТЕНТ БЕЗ СТУПОРА»',
                  description: 'как генерировать идеи каждый день и не выгорать.',
                  video_url: 'https://www.youtube.com/embed/YYYY?rel=0'
                },
                {
                  title: 'ТЕКСТОВЫЕ РИЛС: ФОРМУЛА ЗАХВАТА ВНИМАНИЯ',
                  description: 'структура заголовка и подача, чтобы ролики брали охваты.',
                  video_url: 'https://www.youtube.com/embed/ZZZZ?rel=0'
                },
                {
                  title: 'ПУБЛИКАЦИИ-КАРУСЕЛИ «ЛИСТАЙ, НЕ ОТПУСКАЙ»',
                  description: 'сценарии, ритм и оформление каруселей, которые дочитывают.',
                  video_url: 'https://www.youtube.com/embed/WWWW?rel=0'
                }
              ]
            } else {
              lessons = [
                {
                  title: `Введение в ${topic.title.toLowerCase()}`,
                  description: `Основные концепции и принципы ${topic.title.toLowerCase()}`,
                  video_url: ''
                },
                {
                  title: `Практика: ${topic.title}`,
                  description: `Практические упражнения по теме ${topic.title.toLowerCase()}`,
                  video_url: ''
                },
                {
                  title: `Продвинутые техники`,
                  description: `Углубленное изучение ${topic.title.toLowerCase()}`,
                  video_url: ''
                }
              ]
            }
            
            lessons.forEach((lesson, lessonIndex) => {
              db.run(
                "INSERT INTO lessons (topic_id, title, description, video_url, order_index) VALUES (?, ?, ?, ?, ?)",
                [topicId, lesson.title, lesson.description, lesson.video_url, lessonIndex + 1]
              )
            })
          }
        )
      })
    }
  })
})

// API Routes

// Получить все темы
app.get('/api/topics', (req, res) => {
  db.all(`
    SELECT t.*, 
           COUNT(l.id) as lesson_count,
           COUNT(CASE WHEN up.completed = 1 THEN 1 END) as completed_lessons
    FROM topics t
    LEFT JOIN lessons l ON t.id = l.topic_id
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = 'default_user'
    GROUP BY t.id
    ORDER BY t.id
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    const topics = rows.map(row => ({
      ...row,
      progress: row.lesson_count > 0 ? Math.round((row.completed_lessons / row.lesson_count) * 100) : 0
    }))
    
    res.json(topics)
  })
})

// Получить тему по ID
app.get('/api/topics/:id', (req, res) => {
  const { id } = req.params
  
  db.get('SELECT * FROM topics WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (!row) {
      res.status(404).json({ error: 'Тема не найдена' })
      return
    }
    
    res.json(row)
  })
})

// Получить уроки темы
app.get('/api/topics/:id/lessons', (req, res) => {
  const { id } = req.params
  
  db.all(`
    SELECT l.*, 
           COALESCE(up.completed, 0) as is_completed
    FROM lessons l
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = 'default_user'
    WHERE l.topic_id = ?
    ORDER BY l.order_index, l.id
  `, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    res.json(rows)
  })
})

// Получить урок по ID
app.get('/api/lessons/:id', (req, res) => {
  const { id } = req.params
  
  db.get(`
    SELECT l.*, t.title as topic_title,
           COALESCE(up.completed, 0) as is_completed
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = 'default_user'
    WHERE l.id = ?
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (!row) {
      res.status(404).json({ error: 'Урок не найден' })
      return
    }
    
    res.json(row)
  })
})

// Отметить урок как пройденный/не пройденный
app.post('/api/lessons/:id/complete', (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  const userId = 'default_user'
  
  if (completed) {
    // Отмечаем как пройденный
    db.run(`
      INSERT OR REPLACE INTO user_progress (user_id, lesson_id, completed, completed_at)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    `, [userId, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({ success: true, completed: true })
    })
  } else {
    // Убираем отметку о прохождении
    db.run(`
      DELETE FROM user_progress 
      WHERE user_id = ? AND lesson_id = ?
    `, [userId, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({ success: true, completed: false })
    })
  }
})

// Получить общий прогресс пользователя
app.get('/api/progress', (req, res) => {
  const userId = 'default_user'
  
  db.get(`
    SELECT 
      COUNT(l.id) as total_lessons,
      COUNT(up.id) as completed_lessons
    FROM lessons l
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ? AND up.completed = 1
  `, [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    const progress = row.total_lessons > 0 ? Math.round((row.completed_lessons / row.total_lessons) * 100) : 0
    
    res.json({
      total_lessons: row.total_lessons,
      completed_lessons: row.completed_lessons,
      progress_percentage: progress
    })
  })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Что-то пошло не так!' })
})

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

// Запуск сервера
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Backend сервер запущен на порту ${PORT}`)
  console.log(`📊 API доступно по адресу: http://localhost:${PORT}/api`)
  console.log(`💾 База данных: ${dbPath}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка сервера...')
  db.close((err) => {
    if (err) {
      console.error('Ошибка закрытия базы данных:', err.message)
    } else {
      console.log('✅ База данных закрыта')
    }
    process.exit(0)
  })
})