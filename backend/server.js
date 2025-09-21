const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Инициализация базы данных
const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Создание таблиц при запуске
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      photo_url TEXT,
      auth_date INTEGER,
      hash TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

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
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
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
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
      UNIQUE(user_id, lesson_id)
    )
  `)

  // Таблица советов для уроков
  db.run(`
    CREATE TABLE IF NOT EXISTS lesson_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
    )
  `)

  // Таблица материалов для уроков
  db.run(`
    CREATE TABLE IF NOT EXISTS lesson_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      type TEXT DEFAULT 'link',
      content TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
    )
  `)

  // Таблица файлов для уроков
  db.run(`
    CREATE TABLE IF NOT EXISTS lesson_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'document',
      size INTEGER,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
    )
  `)

  // Добавляем тестовые данные если таблицы пустые
  db.get("SELECT COUNT(*) as count FROM topics", (err, row) => {
    if (row.count === 0) {
      // Добавляем тестовые темы
      const topics = [
        { title: 'Система лёгкого контента', description: 'Короткая, понятная система для роста блога и стабильного контента.' },
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
            
            if (index === 0) { // Система лёгкого контента - 4 урока
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

// Функции аутентификации

// Проверка подписи Telegram WebApp
function verifyTelegramWebAppData(initData, botToken) {
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get('hash')
  urlParams.delete('hash')
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  
  return calculatedHash === hash
}

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' })
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' })
    }
    req.user = user
    next()
  })
}

// Опциональная аутентификация (не требует токен, но проверяет если есть)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (!err) {
        req.user = user
      }
    })
  }
  
  next()
}

// API Routes

// === АУТЕНТИФИКАЦИЯ ===

// Аутентификация через Telegram WebApp
app.post('/api/auth/telegram', (req, res) => {
  const { initData } = req.body
  
  if (!initData) {
    return res.status(400).json({ error: 'Данные инициализации не предоставлены' })
  }
  
  // В продакшене здесь должна быть проверка подписи
  // const botToken = process.env.TELEGRAM_BOT_TOKEN
  // if (!verifyTelegramWebAppData(initData, botToken)) {
  //   return res.status(401).json({ error: 'Недействительные данные Telegram' })
  // }
  
  try {
    // Парсим данные пользователя из initData
    const urlParams = new URLSearchParams(initData)
    const userParam = urlParams.get('user')
    
    if (!userParam) {
      return res.status(400).json({ error: 'Данные пользователя не найдены' })
    }
    
    const userData = JSON.parse(decodeURIComponent(userParam))
    
    // Сохраняем или обновляем пользователя в базе данных
    db.run(`
      INSERT OR REPLACE INTO users 
      (telegram_id, username, first_name, last_name, photo_url, auth_date, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      userData.id.toString(),
      userData.username || null,
      userData.first_name || null,
      userData.last_name || null,
      userData.photo_url || null,
      Math.floor(Date.now() / 1000)
    ], function(err) {
      if (err) {
        console.error('Ошибка сохранения пользователя:', err)
        return res.status(500).json({ error: 'Ошибка сохранения пользователя' })
      }
      
      // Создаем JWT токен
      const token = jwt.sign(
        { 
          userId: this.lastID || userData.id,
          telegramId: userData.id.toString(),
          username: userData.username,
          firstName: userData.first_name
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      )
      
      res.json({
        success: true,
        token,
        user: {
          id: this.lastID || userData.id,
          telegramId: userData.id.toString(),
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          photoUrl: userData.photo_url
        }
      })
    })
    
  } catch (error) {
    console.error('Ошибка парсинга данных пользователя:', error)
    res.status(400).json({ error: 'Некорректные данные пользователя' })
  }
})

// Получить информацию о текущем пользователе
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, telegram_id, username, first_name, last_name, photo_url, created_at FROM users WHERE telegram_id = ?',
    [req.user.telegramId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }
      
      res.json({
        id: row.id,
        telegramId: row.telegram_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        photoUrl: row.photo_url,
        createdAt: row.created_at
      })
    }
  )
})

// === ТЕМЫ И УРОКИ ===

// Получить все темы
app.get('/api/topics', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.telegramId : 'default_user'
  
  db.all(`
    SELECT t.*, 
           COUNT(l.id) as lesson_count,
           COUNT(CASE WHEN up.completed = 1 THEN 1 END) as completed_lessons
    FROM topics t
    LEFT JOIN lessons l ON t.id = l.topic_id
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    GROUP BY t.id
    ORDER BY t.id
  `, [userId], (err, rows) => {
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
app.get('/api/topics/:id/lessons', optionalAuth, (req, res) => {
  const { id } = req.params
  const userId = req.user ? req.user.telegramId : 'default_user'
  
  db.all(`
    SELECT l.*, 
           COALESCE(up.completed, 0) as is_completed
    FROM lessons l
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    WHERE l.topic_id = ?
    ORDER BY l.order_index, l.id
  `, [userId, id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    res.json(rows)
  })
})

// Получить все уроки
app.get('/api/lessons', optionalAuth, (req, res) => {
  const { include } = req.query
  const userId = req.user ? req.user.telegramId : 'default_user'
  
  db.all(`
    SELECT l.*, t.title as topic_title,
           COALESCE(up.completed, 0) as is_completed
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    ORDER BY l.topic_id, l.order_index, l.id
  `, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    // Добавляем объект topic для каждого урока
    const lessons = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      video_url: row.video_url,
      order: row.order_index,
      topicId: row.topic_id,
      is_completed: row.is_completed,
      topic: {
        id: row.topic_id,
        title: row.topic_title
      }
    }))
    
    if (include) {
      const includeArray = include.split(',')
      let completedLessons = 0
      
      // Если нужно включить дополнительные данные, получаем их для каждого урока
      Promise.all(lessons.map(lesson => {
        return new Promise((resolve) => {
          const promises = []
          
          if (includeArray.includes('tips')) {
            promises.push(new Promise((resolveTips) => {
              db.all('SELECT * FROM lesson_tips WHERE lesson_id = ? ORDER BY order_index ASC', [lesson.id], (err, tips) => {
                lesson.tips = err ? [] : tips
                resolveTips()
              })
            }))
          }
          
          if (includeArray.includes('materials')) {
            promises.push(new Promise((resolveMaterials) => {
              db.all('SELECT * FROM lesson_materials WHERE lesson_id = ? ORDER BY order_index ASC', [lesson.id], (err, materials) => {
                lesson.materials = err ? [] : materials
                resolveMaterials()
              })
            }))
          }
          
          if (includeArray.includes('files')) {
            promises.push(new Promise((resolveFiles) => {
              db.all('SELECT * FROM lesson_files WHERE lesson_id = ? ORDER BY order_index ASC', [lesson.id], (err, files) => {
                lesson.files = err ? [] : files
                resolveFiles()
              })
            }))
          }
          
          Promise.all(promises).then(() => resolve(lesson))
        })
      })).then((lessonsWithIncludes) => {
        res.json(lessonsWithIncludes)
      })
    } else {
      res.json(lessons)
    }
  })
})

// Получить урок по ID
app.get('/api/lessons/:id', optionalAuth, (req, res) => {
  const { id } = req.params
  const userId = req.user ? req.user.telegramId : 'default_user'
  
  db.get(`
    SELECT l.*, t.title as topic_title,
           COALESCE(up.completed, 0) as is_completed
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    WHERE l.id = ?
  `, [userId, id], (err, row) => {
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
app.post('/api/lessons/:id/complete', optionalAuth, (req, res) => {
  const { id } = req.params
  const { completed } = req.body
  const userId = req.user ? req.user.telegramId : 'default_user'
  
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

// Создать новую тему
app.post('/api/topics', (req, res) => {
  const { title, description } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название темы обязательно' })
    return
  }
  
  db.run(
    'INSERT INTO topics (title, description) VALUES (?, ?)',
    [title, description || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({
        id: this.lastID,
        title,
        description: description || null,
        created_at: new Date().toISOString()
      })
    }
  )
})

// Создать новый урок
app.post('/api/topics/:topicId/lessons', (req, res) => {
  const { topicId } = req.params
  const { title, description, content, videoUrl, order } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название урока обязательно' })
    return
  }
  
  // Проверяем, существует ли тема
  db.get('SELECT id FROM topics WHERE id = ?', [topicId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (!row) {
      res.status(404).json({ error: 'Тема не найдена' })
      return
    }
    
    db.run(
      'INSERT INTO lessons (topic_id, title, description, video_url, order_index) VALUES (?, ?, ?, ?, ?)',
      [topicId, title, description || null, videoUrl || null, order || 0],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        
        res.json({
          id: this.lastID,
          title,
          description: description || null,
          video_url: videoUrl || null,
          order: order || 0,
          topicId: parseInt(topicId),
          created_at: new Date().toISOString()
        })
      }
    )
  })
})

// Удалить урок
app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM lessons WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Урок не найден' })
      return
    }
    
    res.json({ success: true, message: 'Урок успешно удален' })
  })
})

// Редактировать тему
app.put('/api/topics/:id', (req, res) => {
  const { id } = req.params
  const { title, description } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название темы обязательно' })
    return
  }
  
  db.run(
    'UPDATE topics SET title = ?, description = ? WHERE id = ?',
    [title, description || null, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Тема не найдена' })
        return
      }
      
      res.json({ success: true, message: 'Тема успешно обновлена' })
    }
  )
})

// Редактировать урок
app.put('/api/lessons/:id', (req, res) => {
  const { id } = req.params
  const { title, description, content, videoUrl, topicId, order } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название урока обязательно' })
    return
  }
  
  db.run(
    'UPDATE lessons SET title = ?, description = ?, video_url = ?, topic_id = ?, order_index = ? WHERE id = ?',
    [title, description || null, videoUrl || null, topicId, order || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Урок не найден' })
        return
      }
      
      res.json({ success: true, message: 'Урок успешно обновлен' })
    }
  )
})

// Удалить тему
app.delete('/api/topics/delete', (req, res) => {
  const { id } = req.query
  
  if (!id) {
    res.status(400).json({ error: 'ID темы обязателен' })
    return
  }
  
  // Сначала удаляем все уроки темы
  db.run('DELETE FROM lessons WHERE topic_id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    // Затем удаляем саму тему
    db.run('DELETE FROM topics WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Тема не найдена' })
        return
      }
      
      res.json({ success: true, message: 'Тема успешно удалена' })
    })
  })
})

// Получить общий прогресс пользователя
app.get('/api/progress', optionalAuth, (req, res) => {
  const userId = req.user ? req.user.telegramId : 'default_user'
  
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

// === API для советов уроков ===

// Получить советы урока
app.get('/api/lessons/:id/tips', (req, res) => {
  const { id } = req.params
  
  db.all(
    'SELECT * FROM lesson_tips WHERE lesson_id = ? ORDER BY order_index ASC, created_at ASC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(rows)
    }
  )
})

// Создать совет для урока
app.post('/api/lessons/:id/tips', (req, res) => {
  const { id } = req.params
  const { title, content, order } = req.body
  
  if (!title || !content) {
    res.status(400).json({ error: 'Название и содержание совета обязательны' })
    return
  }
  
  db.run(
    'INSERT INTO lesson_tips (lesson_id, title, content, order_index) VALUES (?, ?, ?, ?)',
    [id, title, content, order || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({
        id: this.lastID,
        lesson_id: parseInt(id),
        title,
        content,
        order_index: order || 0,
        created_at: new Date().toISOString()
      })
    }
  )
})

// Обновить совет
app.put('/api/tips/:id', (req, res) => {
  const { id } = req.params
  const { title, content, order } = req.body
  
  if (!title || !content) {
    res.status(400).json({ error: 'Название и содержание совета обязательны' })
    return
  }
  
  db.run(
    'UPDATE lesson_tips SET title = ?, content = ?, order_index = ? WHERE id = ?',
    [title, content, order || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Совет не найден' })
        return
      }
      
      res.json({ success: true, message: 'Совет успешно обновлен' })
    }
  )
})

// Удалить совет
app.delete('/api/tips/:id', (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM lesson_tips WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Совет не найден' })
      return
    }
    
    res.json({ success: true, message: 'Совет успешно удален' })
  })
})

// === API для материалов уроков ===

// Получить материалы урока
app.get('/api/lessons/:id/materials', (req, res) => {
  const { id } = req.params
  
  db.all(
    'SELECT * FROM lesson_materials WHERE lesson_id = ? ORDER BY order_index ASC, created_at ASC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(rows)
    }
  )
})

// Создать материал для урока
app.post('/api/lessons/:id/materials', (req, res) => {
  const { id } = req.params
  const { title, description, url, type, content, order } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название материала обязательно' })
    return
  }
  
  db.run(
    'INSERT INTO lesson_materials (lesson_id, title, description, url, type, content, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, description || null, url || null, type || 'link', content || null, order || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({
        id: this.lastID,
        lesson_id: parseInt(id),
        title,
        description: description || null,
        url: url || null,
        type: type || 'link',
        content: content || null,
        order_index: order || 0,
        created_at: new Date().toISOString()
      })
    }
  )
})

// Обновить материал
app.put('/api/materials/:id', (req, res) => {
  const { id } = req.params
  const { title, description, url, type, content, order } = req.body
  
  if (!title) {
    res.status(400).json({ error: 'Название материала обязательно' })
    return
  }
  
  db.run(
    'UPDATE lesson_materials SET title = ?, description = ?, url = ?, type = ?, content = ?, order_index = ? WHERE id = ?',
    [title, description || null, url || null, type || 'link', content || null, order || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Материал не найден' })
        return
      }
      
      res.json({ success: true, message: 'Материал успешно обновлен' })
    }
  )
})

// Удалить материал
app.delete('/api/materials/:id', (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM lesson_materials WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Материал не найден' })
      return
    }
    
    res.json({ success: true, message: 'Материал успешно удален' })
  })
})

// === API для файлов уроков ===

// Получить файлы урока
app.get('/api/lessons/:id/files', (req, res) => {
  const { id } = req.params
  
  db.all(
    'SELECT * FROM lesson_files WHERE lesson_id = ? ORDER BY order_index ASC, created_at ASC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(rows)
    }
  )
})

// Создать файл для урока
app.post('/api/lessons/:id/files', (req, res) => {
  const { id } = req.params
  const { filename, url, type, size, order } = req.body
  
  if (!filename || !url) {
    res.status(400).json({ error: 'Имя файла и URL обязательны' })
    return
  }
  
  db.run(
    'INSERT INTO lesson_files (lesson_id, filename, url, type, size, order_index) VALUES (?, ?, ?, ?, ?, ?)',
    [id, filename, url, type || 'document', size || null, order || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      res.json({
        id: this.lastID,
        lesson_id: parseInt(id),
        filename,
        url,
        type: type || 'document',
        size: size || null,
        order_index: order || 0,
        created_at: new Date().toISOString()
      })
    }
  )
})

// Обновить файл
app.put('/api/files/:id', (req, res) => {
  const { id } = req.params
  const { filename, url, type, size, order } = req.body
  
  if (!filename || !url) {
    res.status(400).json({ error: 'Имя файла и URL обязательны' })
    return
  }
  
  db.run(
    'UPDATE lesson_files SET filename = ?, url = ?, type = ?, size = ?, order_index = ? WHERE id = ?',
    [filename, url, type || 'document', size || null, order || 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Файл не найден' })
        return
      }
      
      res.json({ success: true, message: 'Файл успешно обновлен' })
    }
  )
})

// Удалить файл
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM lesson_files WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Файл не найден' })
      return
    }
    
    res.json({ success: true, message: 'Файл успешно удален' })
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