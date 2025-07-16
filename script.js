const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const reminderInput = document.getElementById("reminder-time");

let todos = JSON.parse(localStorage.getItem("neonTodos")) || [];

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else {
    alert(body); // fallback
  }
}

function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");

    const timeRemaining = getTimeRemaining(todo);
    const timerText = todo.remindAt ? `<span class="timer">⏱ ${timeRemaining}</span>` : "";

    li.innerHTML = `
      <div class="todo-left">
        <input type="checkbox" onchange="toggleTodo(${index})" ${todo.completed ? "checked" : ""} />
        <span ondblclick="editTodo(${index})">${todo.text}</span>
        ${timerText}
      </div>
      <button onclick="deleteTodo(${index})">❌</button>
    `;
    list.appendChild(li);
  });
  updateProgress();
}

function addTodo() {
  const text = input.value.trim();
  const minutes = parseInt(reminderInput.value);
  if (text !== "") {
    const newTodo = {
      text,
      completed: false,
      remindAt: !isNaN(minutes) && minutes > 0 ? Date.now() + minutes * 60000 : null,
      notified: false
    };
    todos.push(newTodo);
    input.value = "";
    reminderInput.value = "";
    saveTodos();
  }
}

function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
}

function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
}

function editTodo(index) {
  const newText = prompt("Edit your task:", todos[index].text);
  if (newText !== null && newText.trim() !== "") {
    todos[index].text = newText.trim();
    saveTodos();
  }
}

function saveTodos() {
  localStorage.setItem("neonTodos", JSON.stringify(todos));
  renderTodos();
}

function updateProgress() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const percent = total === 0 ? 0 : (completed / total) * 100;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${completed} / ${total} completed`;
}

function getTimeRemaining(todo) {
  if (!todo.remindAt) return "";
  const diff = todo.remindAt - Date.now();
  if (diff <= 0) return "00:00";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startCountdowns() {
  setInterval(() => {
    todos.forEach((todo, index) => {
      if (todo.remindAt && Date.now() >= todo.remindAt && !todo.notified) {
        notify("⏰ Reminder!", `"${todo.text}" is due now!`);
        todo.notified = true;
        saveTodos();
      }
    });
    renderTodos();
  }, 1000);
}

requestNotificationPermission();
renderTodos();
startCountdowns();





