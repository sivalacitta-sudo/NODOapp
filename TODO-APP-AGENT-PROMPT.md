# 个人待办事项全栈应用 — Agent 执行 Prompt

## 项目目标
创建一个支持用户认证的待办事项管理应用，用户可以注册登录后管理自己的待办。

## 技术约束（硬性要求）

- **后端**：Node.js + Express（纯 CommonJS 或 ES Module，禁止 TypeScript）
- **前端**：原生 HTML/CSS/JS（禁止 React/Vue/Bootstrap 等任何框架或库）
- **数据库**：SQLite3（使用 `sqlite3` npm 包）
- **数据库文件**：`data/todo.db`，存放在项目根目录 `data/` 文件夹下
- **接口规范**：RESTful API，前后端通过 JSON 通信
- **跨域**：后端配置 `cors` 中间件
- **禁止额外依赖**：只允许使用 `express`、`sqlite3`、`cors`、`bcryptjs`、`jsonwebtoken`、`nodemon`（开发依赖）

## 目录结构

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
└── public/                # 静态资源目录（Express 托管）
    ├── index.html         # 前端页面
    ├── style.css          # 样式表
    └── app.js             # 前端交互逻辑
```

## 数据库设计

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | 用户ID |
| username | TEXT NOT NULL UNIQUE | 用户名 |
| password | TEXT NOT NULL | bcrypt 加密后的密码 |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### todos 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | 待办ID |
| user_id | INTEGER NOT NULL | 所属用户ID |
| task | TEXT NOT NULL | 任务内容 |
| completed | INTEGER NOT NULL DEFAULT 0 | 0=未完成，1=已完成 |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## API 接口规范

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
| POST | /api/todos | 创建待办 `{ "task": "内容" }` | ✅ |
| PUT | /api/todos/:id | 更新待办 `{ "task": "内容" }` 或 `{ "completed": 0/1 }` | ✅ |
| DELETE | /api/todos/:id | 删除待办 | ✅ |

## 分步执行计划

> ⚠️ **重要：严格按顺序执行，每步完成后停下来等待确认。**

---

### Step 1：项目初始化与依赖安装

```
1. 创建 todo-app 目录
2. npm init -y 初始化项目
3. 安装依赖：npm install express sqlite3 cors bcryptjs jsonwebtoken
4. 安装开发依赖：npm install --save-dev nodemon
5. 创建目录结构：
   - mkdir src/routes src/middleware data public
6. 在 package.json 中配置 scripts：
   "scripts": {
     "dev": "nodemon server.js",
     "start": "node server.js"
   }
```

**完成后报告：package.json 内容、目录结构**

---

### Step 2：数据库层

```
1. 创建 src/db.js：
   - 连接 SQLite 数据库（data/todo.db）
   - 启动时自动创建 users 和 todos 表（IF NOT EXISTS）
   - 导出 db 对象供其他模块使用
2. 启动服务验证 data/todo.db 是否自动生成
```

**完成后报告：db.js 核心代码、数据表创建成功确认**

---

### Step 3：后端 — 认证模块

```
1. 创建 src/middleware/auth.js：
   - 解析 JWT token
   - 验证有效则挂载 user 到 req
   - 无效或无 token 返回 401

2. 创建 src/routes/authRoutes.js：
   - POST /register：bcrypt 加密密码，存入 users 表
   - POST /login：验证密码，签发 JWT（有效期 7 天）
   - GET /me：返回当前用户信息

3. 在 server.js 中挂载路由：app.use('/api/auth', authRoutes)
```

**完成后报告：auth.js 和 authRoutes.js 核心代码**

---

### Step 4：后端 — 待办模块

```
1. 创建 src/routes/todoRoutes.js：
   - 所有接口需要 req.user（已由 auth 中间件注入）
   - 所有 SQL 查询需带上 user_id 条件（用户隔离数据）
   - GET /api/todos：查询 todos 表，WHERE user_id = ?
   - POST /api/todos：插入新记录
   - PUT /api/todos/:id：更新任务内容或完成状态，校验 ownership
   - DELETE /api/todos/:id：删除记录，校验 ownership

2. 在 server.js 中挂载路由：app.use('/api/todos', todoRoutes)
   确保 todoRoutes 之前已加载 auth 中间件
```

**完成后报告：todoRoutes.js 核心代码、API 测试结果**

---

### Step 5：后端 — server.js

```
创建 server.js，包含：
- require 所有模块
- express.static 托管 public 目录
- cors 中间件
- json body 解析（express.json()）
- 挂载 /api/auth 和 /api/todos 路由
- 启动监听 3000 端口
- 启动前先初始化数据库
```

**完成后报告：server.js 完整代码**

---

### Step 6-8：前端全部（HTML + CSS + JS）

**设计风格参考**：读取 `C:\Users\lxfom\Desktop\design-md\notion\DESIGN.md`，严格遵循其中的：
- 色彩系统（主色、强调色、边框色、阴影）
- 字体系统（Inter + 字重 + 字间距）
- 阴影哲学（多层极淡）
- 边框哲学（1px rgba 极薄）

**HTML 要求**：
- 登录/注册区域 + 待办管理区域（登录后显示）
- 登录/注册 Tab 切换
- 用户信息栏 + 退出按钮
- 添加待办输入框 + 按钮
- 统计栏（共 X 项 / 已完成 X 项）
- 待办列表 `<ul>`
- Toast 提示消息

**CSS 要求**：
- 响应式，最大宽度 600px，居中
- 纯白背景，Notion 蓝 `#0075de` 作为唯一强调色
- 所有边框：`1px solid rgba(0,0,0,0.1)`
- 输入框：圆角 6px，无厚重边框
- 按钮：圆角 6px，主按钮蓝色，次按钮透明边框

**JS 要求**：
- localStorage 存储 token，自动登录
- Tab 切换登录/注册表单
- 实时统计待办数量
- 已完成项：删除线 + 灰色文字
- Toast 消息 3 秒后自动消失

---

### Step 9：联调测试

浏览器打开 `http://localhost:3000` 验证：
- 注册 → 登录 → 添加/打钩/删除 → 刷新数据不丢 → 退出 → 多用户数据隔离

**完成后报告：测试通过截图或描述**

---

### Step 10：README 文档

```
创建 README.md，包含：
- 项目简介（一句话说明）
- 技术栈列表
- 本地运行步骤：
  1. git clone / npm install
  2. npm run dev
  3. 打开 http://localhost:3000
- API 接口文档（表格形式）
- 数据说明（SQLite 文件位置）
```

**完成后报告：README.md 内容确认**

---

## 交付标准

所有 Step 完成后，项目应满足：
1. ✅ 完整目录结构符合规范
2. ✅ 后端 4 个认证接口 + 4 个待办接口可正常调用
3. ✅ 前端实现完整的增删改查功能
4. ✅ 用户数据严格隔离（A 用户的待办 B 看不到）
5. ✅ 刷新页面数据不丢失
6. ✅ 无 console.error，API 返回统一格式
