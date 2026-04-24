const express = require('express');
const cors = require('cors');
const pathModule = require('path');

// 根据环境变量选择数据库
const isProduction = process.env.NODE_ENV === 'production';

let initDatabase;
if (isProduction) {
  // 生产环境使用 PostgreSQL
  const dbModule = require('./src/db-postgres');
  initDatabase = dbModule.initDatabase;
} else {
  // 开发环境使用 SQLite
  const dbModule = require('./src/db');
  initDatabase = dbModule.initDatabase;
}

const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(pathModule.join(__dirname, 'public')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('数据库初始化成功');
    console.log(`运行环境: ${isProduction ? '生产环境 (PostgreSQL)' : '开发环境 (SQLite)'}`);

    // 启动监听
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('服务器启动失败:', err);
    process.exit(1);
  }
}

startServer();
