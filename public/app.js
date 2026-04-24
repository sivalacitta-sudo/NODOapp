// API 基础URL
const API_BASE = 'http://localhost:8080/api';

// 状态管理
let currentUser = null;
let todos = [];

// DOM 元素
const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const toast = document.getElementById('toast');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// 检查认证状态
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showTodoSection();
            loadTodos();
        } else {
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('认证检查失败:', error);
    }
}

// 设置事件监听
function setupEventListeners() {
    // Tab 切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // 登录表单
    loginForm.addEventListener('submit', handleLogin);

    // 注册表单
    registerForm.addEventListener('submit', handleRegister);

    // 退出
    logoutBtn.addEventListener('click', handleLogout);

    // 添加待办
    addBtn.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });
}

// 切换 Tab
function switchTab(tab) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}

// 登录处理
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showToast('登录成功');
            showTodoSection();
            loadTodos();
        } else {
            showToast(data.error || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showToast('网络错误', 'error');
    }
}

// 注册处理
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('注册成功，请登录');
            switchTab('login');
            loginForm.reset();
        } else {
            showToast(data.error || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showToast('网络错误', 'error');
    }
}

// 显示待办区域
function showTodoSection() {
    authSection.style.display = 'none';
    todoSection.style.display = 'block';
    userInfo.textContent = `欢迎, ${currentUser.username}`;
}

// 退出处理
function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    todos = [];
    authSection.style.display = 'block';
    todoSection.style.display = 'none';
    loginForm.reset();
    registerForm.reset();
    showToast('已退出');
}

// 加载待办列表
async function loadTodos() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/todos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            todos = data.todos;
            renderTodos();
        }
    } catch (error) {
        console.error('加载待办失败:', error);
    }
}

// 渲染待办列表
function renderTodos() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.task)}</span>
            <button class="todo-delete">×</button>
        `;

        // 复选框事件
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id, !todo.completed));

        // 删除按钮事件
        const deleteBtn = li.querySelector('.todo-delete');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });

    updateStats();
}

// 更新统计
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// 添加待办
async function handleAddTodo() {
    const task = todoInput.value.trim();
    if (!task) {
        showToast('请输入任务内容', 'error');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ task })
        });

        if (response.ok) {
            const data = await response.json();
            todos.unshift(data.todo);
            renderTodos();
            todoInput.value = '';
            showToast('添加成功');
        } else {
            showToast('添加失败', 'error');
        }
    } catch (error) {
        console.error('添加待办失败:', error);
        showToast('网络错误', 'error');
    }
}

// 切换完成状态
async function toggleTodo(id, completed) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed })
        });

        if (response.ok) {
            const data = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = data.todo;
                renderTodos();
            }
        }
    } catch (error) {
        console.error('更新待办失败:', error);
    }
}

// 删除待办
async function deleteTodo(id) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            showToast('删除成功');
        } else {
            showToast('删除失败', 'error');
        }
    } catch (error) {
        console.error('删除待办失败:', error);
        showToast('网络错误', 'error');
    }
}

// 显示 Toast
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.9)';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}