// 统一的数据库接口 - 根据环境自动选择 SQLite 或 PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';

let dbModule;
if (isProduction) {
  dbModule = require('./db-postgres');
} else {
  dbModule = require('./db');
}

module.exports = dbModule;
