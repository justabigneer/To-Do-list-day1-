// script.js - Simple todo logic: add/edit/delete/complete with localStorage persistence

const STORAGE_KEY = 'tasks';
// support older key 'task' if present
const storedRaw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('task');
let tasks = storedRaw ? JSON.parse(storedRaw) : [];

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const priorityInput = document.getElementById('priority');
const dueInput = document.getElementById('due');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const todoList = document.getElementById('todolist');
const template = document.getElementById('task-template');
const emptyMessage = document.getElementById('empty-message');

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks(){
  todoList.innerHTML = '';
  if(!tasks.length){
    emptyMessage.style.display = 'block';
    return;
  } else {
    emptyMessage.style.display = 'none';
  }

  tasks.forEach(task => {
    const node = template.content.cloneNode(true);
    const li = node.querySelector('li');
    li.dataset.id = task.id;

    const checkbox = node.querySelector('.task-complete');
    const checkboxId = `task-checkbox-${task.id}`;
    checkbox.id = checkboxId;
    checkbox.checked = !!task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} complete`);

    const label = node.querySelector('.task-title');
    label.setAttribute('for', checkboxId);
    label.querySelector('span').textContent = task.title;

    if(task.completed) li.classList.add('completed');

    const time = node.querySelector('.task-due');
    time.textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
    if(task.dueDate) time.setAttribute('datetime', task.dueDate);

    const priorityEl = node.querySelector('.task-priority');
    priorityEl.textContent = capitalize(task.priority || '');
    if (task.priority) priorityEl.classList.add(task.priority.toLowerCase());

    const editBtn = node.querySelector('.edit');
    const deleteBtn = node.querySelector('.delete');
    editBtn.dataset.id = task.id;
    deleteBtn.dataset.id = task.id;

    todoList.appendChild(node);
  });
}

function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function addTaskFromForm(e){
  e.preventDefault();
  const title = titleInput.value.trim();
  if(!title){ titleInput.focus(); return; }
  const priority = priorityInput.value;
  const dueDate = dueInput.value || '';
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const editingId = form.dataset.editing;

  if(editingId){
    const idx = tasks.findIndex(t => String(t.id) === String(editingId));
    if(idx > -1){
      tasks[idx] = { ...tasks[idx], title, priority, dueDate, category, description };
      delete form.dataset.editing;
      form.querySelector('button[type="submit"]').textContent = 'Add Task';
    }
  } else {
    const newTask = {
      id: Date.now(),
      title,
      priority,
      dueDate,
      category,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  form.reset();
  titleInput.focus();
}

function handleListClick(e){
  const li = e.target.closest('li.task-item');
  if(!li) return;
  const id = li.dataset.id;
  if(e.target.matches('.delete')){
    tasks = tasks.filter(t => String(t.id) !== String(id));
    saveTasks();
    renderTasks();
    return;
  }
  if(e.target.matches('.edit')){
    const t = tasks.find(t => String(t.id) === String(id));
    if(t){
      titleInput.value = t.title;
      priorityInput.value = t.priority;
      dueInput.value = t.dueDate;
      categoryInput.value = t.category;
      descriptionInput.value = t.description;
      form.dataset.editing = t.id;
      form.querySelector('button[type="submit"]').textContent = 'Save';
      titleInput.focus();
    }
    return;
  }
  if(e.target.matches('.task-complete')){
    const t = tasks.find(t => String(t.id) === String(id));
    if(t){
      t.completed = e.target.checked;
      saveTasks();
      renderTasks();
    }
    return;
  }
}

form.addEventListener('submit', addTaskFromForm);
todoList.addEventListener('click', handleListClick);
todoList.addEventListener('change', handleListClick);

renderTasks();