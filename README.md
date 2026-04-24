# 个人待办事项管理应用

一个支持用户认证的全栈待办事项管理应用，用户可以注册登录后管理自己的待办。

## 技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite3
- **前端**: 原生 HTML/CSS/JavaScript
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT  token 认证
- ✅ 待办事项增删改查
- ✅ 用户数据隔离
- ✅ 实时统计待办数量
- ✅ 响应式设计
- ✅ Notion 风格 UI

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm run dev
```

或者

```bash
npm start
```

### 3. 访问应用

打开浏览器访问: http://localhost:8080

## API 接口文档

### 认证接口 `/api/auth`

| 方法 | 路径 | 说明 | 需要鉴权 |
|------|------|------|----------|
| POST | /api/auth/register | 注册用户 | ❌ |
| POST | /api/auth/login | 登录，返回 JWT | ❌ |
| GET | /api/auth/me | 获取当前用户信息 | ✅ |

### 待办接口 `/api/todos`

| 方法 | 路径 | 说明 | 需要鉴权 |
|------|------|------|----------|
| GET | /api/todos | 获取当前用户的待办列表 | ✅ |
| POST | /api/todos | 创建待办 | ✅ |
| PUT | /api/todos/:id | 更新待办 | ✅ |
| DELETE | /api/todos/:id | 删除待办 | ✅ |

## 项目结构

```
todo-app/
├── package.json
├── server.js              # 后端入口
├── data/
│   └── todo.db            # SQLite 数据库文件（自动生成）
├── src/
│   ├── db.js              # 数据库初始化与连接封装
│   ├── routes/
│   │   ├── authRoutes.js  # 用户认证路由
│   │   └── todoRoutes.js  # 待办事项路由
│   └── middleware/
│       └── auth.js        # JWT 鉴权中间件
└── public/                # 静态资源目录
    ├── index.html         # 前端页面
    ├── style.css          # 样式表
    └── app.js             # 前端交互逻辑
```

## 数据库设计

### users 表
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- username: TEXT NOT NULL UNIQUE
- password: TEXT NOT NULL (bcrypt 加密)
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

### todos 表
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- task: TEXT NOT NULL
- completed: INTEGER NOT NULL DEFAULT 0 (0=未完成, 1=已完成)
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

## 使用说明

1. **注册账号**: 点击"注册" Tab，输入用户名和密码
2. **登录**: 使用注册的账号登录
3. **添加待办**: 在输入框中输入任务内容，点击"添加"按钮
4. **完成待办**: 点击待办项左侧的复选框
5. **删除待办**: 点击待办项右侧的 × 按钮
6. **退出登录**: 点击右上角的"退出"按钮

## 注意事项

- 数据库文件位于 `data/todo.db`，首次启动时自动创建
- JWT token 存储在浏览器的 localStorage 中
- 每个用户只能看到和管理自己的待办事项
- 刷新页面后数据不会丢失

## 开发说明

- 使用 nodemon 进行开发，代码修改后自动重启
- 生产环境请修改 JWT_SECRET 为更安全的密钥
- 建议在生产环境使用 HTTPS

## License

MIT
