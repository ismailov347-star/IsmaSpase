import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    youtube_url TEXT NOT NULL,
    is_published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    UNIQUE(user_id, lesson_id)
  );
`);

// Seed data for lessons
const insertLesson = db.prepare(`
  INSERT OR IGNORE INTO lessons (id, title, order_index, youtube_url)
  VALUES (?, ?, ?, ?)
`);

const lessons = [
  { id: 1, title: 'Упаковка блога', order_index: 1, youtube_url: 'https://www.youtube.com/watch?v=UNLISTED_ID_1' },
  { id: 2, title: 'Система идей: Контент без ступора', order_index: 2, youtube_url: 'https://www.youtube.com/watch?v=UNLISTED_ID_2' },
  { id: 3, title: 'Суть текстовых рилс. Формула захвата внимания', order_index: 3, youtube_url: 'https://www.youtube.com/watch?v=UNLISTED_ID_3' },
  { id: 4, title: 'Публикации-карусели. "Листай — не отпускай"', order_index: 4, youtube_url: 'https://www.youtube.com/watch?v=UNLISTED_ID_4' }
];

lessons.forEach(lesson => {
  insertLesson.run(lesson.id, lesson.title, lesson.order_index, lesson.youtube_url);
});

// Create default user for MVP
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, telegram_id, name)
  VALUES (?, ?, ?)
`);

insertUser.run(1, 'default_user', 'Default User');

export default db;

// Helper functions
export const getLessons = () => {
  const stmt = db.prepare('SELECT * FROM lessons WHERE is_published = 1 ORDER BY order_index');
  return stmt.all();
};

export const getLesson = (id: number) => {
  const stmt = db.prepare('SELECT * FROM lessons WHERE id = ? AND is_published = 1');
  return stmt.get(id);
};

export const getUserProgress = (userId: number) => {
  const stmt = db.prepare(`
    SELECT lesson_id, completed_at 
    FROM progress 
    WHERE user_id = ?
  `);
  return stmt.all(userId);
};

export const toggleProgress = (userId: number, lessonId: number) => {
  const checkStmt = db.prepare('SELECT completed_at FROM progress WHERE user_id = ? AND lesson_id = ?');
  const existing = checkStmt.get(userId, lessonId) as { completed_at: string | null } | undefined;
  
  if (existing) {
    // Toggle existing progress
    const newCompletedAt = existing.completed_at ? null : new Date().toISOString();
    const updateStmt = db.prepare(`
      UPDATE progress 
      SET completed_at = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND lesson_id = ?
    `);
    updateStmt.run(newCompletedAt, userId, lessonId);
    return { completed: !!newCompletedAt };
  } else {
    // Create new progress entry
    const insertStmt = db.prepare(`
      INSERT INTO progress (user_id, lesson_id, completed_at)
      VALUES (?, ?, ?)
    `);
    insertStmt.run(userId, lessonId, new Date().toISOString());
    return { completed: true };
  }
};

export const getProgressStats = (userId: number) => {
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM lessons WHERE is_published = 1');
  const completedStmt = db.prepare(`
    SELECT COUNT(*) as completed 
    FROM progress 
    WHERE user_id = ? AND completed_at IS NOT NULL
  `);
  
  const total = (totalStmt.get() as { total: number }).total;
  const completed = (completedStmt.get(userId) as { completed: number }).completed;
  
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};