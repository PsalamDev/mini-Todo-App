const STORAGE_KEY = 'mini-todo-app-items';
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const summary = document.getElementById('summary');
const clearCompleted = document.getElementById('clear-completed');
const filters = document.querySelectorAll('.filter-btn');

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getVisibleTodos() {
  if (currentFilter === 'active') return todos.filter((item) => !item.completed);
  if (currentFilter === 'completed') return todos.filter((item) => item.completed);
  return todos;
}

function render() {
  const visibleTodos = getVisibleTodos();
  const remaining = todos.filter((item) => !item.completed).length;

  summary.textContent = `${remaining} task${remaining === 1 ? '' : 's'} left`;

  if (!visibleTodos.length) {
    todoList.innerHTML = '<li class="empty-state">No tasks to show in this view.</li>';
    return;
  }

  todoList.innerHTML = visibleTodos
    .map((todo) => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <label class="todo-main">
          <input class="todo-checkbox" type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Mark ${todo.text} as complete" />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
        </label>
        <button class="delete-btn" type="button" aria-label="Delete ${todo.text}">Delete</button>
      </li>
    `)
    .join('');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: Date.now(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('.delete-btn');
  if (button) {
    const item = button.closest('.todo-item');
    if (item) deleteTodo(Number(item.dataset.id));
    return;
  }
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.todo-checkbox');
  if (checkbox) {
    const item = checkbox.closest('.todo-item');
    if (item) toggleTodo(Number(item.dataset.id));
  }
});

clearCompleted.addEventListener('click', () => {
  todos = todos.filter((item) => !item.completed);
  saveTodos();
  render();
});

render();
