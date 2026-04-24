const { Pool } = require('pg');

// 从环境变量获取数据库连接字符串
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 初始化数据表
async function initDatabase() {
  const client = await pool.connect();
  try {
    // 创建 users 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('users 表就绪');

    // 创建 todos 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        task TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('todos 表就绪');
  } finally {
    client.release();
  }
}

// 封装查询方法，兼容原有的 sqlite3 API
const db = {
  run: async (sql, params, callback) => {
    try {
      const result = await pool.query(sql, params);
      if (callback) {
        callback.call({ lastID: result.rows[0]?.id }, null);
      }
    } catch (err) {
      if (callback) callback(err);
    }
  },
  
  get: async (sql, params, callback) => {
    try {
      const result = await pool.query(sql, params);
      if (callback) callback(null, result.rows[0] || null);
    } catch (err) {
      if (callback) callback(err);
    }
  },
  
  all: async (sql, params, callback) => {
    try {
      const result = await pool.query(sql, params);
      if (callback) callback(null, result.rows);
    } catch (err) {
      if (callback) callback(err);
    }
  }
};

module.exports = { db, initDatabase };
