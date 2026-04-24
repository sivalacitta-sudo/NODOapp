const { Pool } = require('pg');

let pool = null;

// 获取数据库连接池（延迟初始化）
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // 监听连接错误
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

// 初始化数据表
async function initDatabase() {
  const client = await getPool().connect();
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
      const result = await getPool().query(sql, params);
      if (callback) {
        callback.call({ lastID: result.rows[0]?.id }, null);
      }
    } catch (err) {
      if (callback) callback(err);
    }
  },
  
  get: async (sql, params, callback) => {
    try {
      const result = await getPool().query(sql, params);
      if (callback) callback(null, result.rows[0] || null);
    } catch (err) {
      if (callback) callback(err);
    }
  },
  
  all: async (sql, params, callback) => {
    try {
      const result = await getPool().query(sql, params);
      if (callback) callback(null, result.rows);
    } catch (err) {
      if (callback) callback(err);
    }
  }
};

module.exports = { db, initDatabase };
