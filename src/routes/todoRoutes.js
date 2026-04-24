const express = require('express');
const { db } = require('../index');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(authMiddleware);

// GET /api/todos - 获取当前用户的待办列表
router.get('/', (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('查询待办失败:', err);
        return res.status(500).json({ error: '服务器内部错误' });
      }
      res.json({ todos: rows });
    }
  );
});

// POST /api/todos - 创建待办
router.post('/', (req, res) => {
  const { task } = req.body;
  const userId = req.user.id;

  if (!task || !task.trim()) {
    return res.status(400).json({ error: '任务内容不能为空' });
  }

  db.run(
    'INSERT INTO todos (user_id, task) VALUES (?, ?)',
    [userId, task.trim()],
    function (err) {
      if (err) {
        console.error('创建待办失败:', err);
        return res.status(500).json({ error: '服务器内部错误' });
      }

      // 返回新创建的待办
      db.get(
        'SELECT * FROM todos WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('查询待办失败:', err);
            return res.status(500).json({ error: '服务器内部错误' });
          }
          res.status(201).json({ todo: row });
        }
      );
    }
  );
});

// PUT /api/todos/:id - 更新待办
router.put('/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const userId = req.user.id;
  const { task, completed } = req.body;

  // 先验证所有权
  db.get(
    'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    [todoId, userId],
    (err, todo) => {
      if (err) {
        console.error('查询待办失败:', err);
        return res.status(500).json({ error: '服务器内部错误' });
      }

      if (!todo) {
        return res.status(404).json({ error: '待办不存在或无权访问' });
      }

      // 构建更新字段
      const updates = [];
      const values = [];

      if (task !== undefined) {
        updates.push('task = ?');
        values.push(task.trim());
      }

      if (completed !== undefined) {
        updates.push('completed = ?');
        values.push(completed ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: '没有提供更新内容' });
      }

      values.push(todoId);

      db.run(
        `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            console.error('更新待办失败:', err);
            return res.status(500).json({ error: '服务器内部错误' });
          }

          // 返回更新后的待办
          db.get(
            'SELECT * FROM todos WHERE id = ?',
            [todoId],
            (err, updatedTodo) => {
              if (err) {
                console.error('查询待办失败:', err);
                return res.status(500).json({ error: '服务器内部错误' });
              }
              res.json({ todo: updatedTodo });
            }
          );
        }
      );
    }
  );
});

// DELETE /api/todos/:id - 删除待办
router.delete('/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const userId = req.user.id;

  // 先验证所有权
  db.get(
    'SELECT * FROM todos WHERE id = ? AND user_id = ?',
    [todoId, userId],
    (err, todo) => {
      if (err) {
        console.error('查询待办失败:', err);
        return res.status(500).json({ error: '服务器内部错误' });
      }

      if (!todo) {
        return res.status(404).json({ error: '待办不存在或无权访问' });
      }

      db.run(
        'DELETE FROM todos WHERE id = ?',
        [todoId],
        function (err) {
          if (err) {
            console.error('删除待办失败:', err);
            return res.status(500).json({ error: '服务器内部错误' });
          }
          res.json({ message: '删除成功' });
        }
      );
    }
  );
});

module.exports = router;
