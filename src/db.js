const sqlite3 = require('sqlite3');
const pathModule = require('path');

// 数据库文件路径
const DB_PATH = pathModule.join(__dirname, '..', 'data', 'todo.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('SQLite 数据库连接成功');
  }
});

// 初始化数据表
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建 users 表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('创建 users 表失败:', err.message);
          reject(err);
          return;
        }
        console.log('users 表就绪');
      });

      // 创建 todos 表
      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          task TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('创建 todos 表失败:', err.message);
          reject(err);
          return;
        }
        console.log('todos 表就绪');
        resolve();
      });
    });
  });
}

module.exports = { db, initDatabase };
