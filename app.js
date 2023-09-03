const STATUS = {
  open: 'open',
  doing: 'doing',
  completed: 'completed'
}
const newForm = document.querySelector("#js-new-form")
const editForm = document.querySelector("#js-edit-form")
const newInput = document.querySelector(".new-form__input")
const newInputDate = document.querySelector(".new-form__date")
const todoListDom = document.querySelector(".todo-list")
const todoBtnEdit = document.querySelectorAll('.todo-item__action')
const filterSelect = document.querySelector('.filter-select')
const currentDate = (new Date).toISOString().slice(0, 10)
const noDataContent = '<p class="no-data text-center">No data to display.</p>'

const generateUid = function(){
  return Math.floor(Math.random() * Date.now()).toString(16)
}

const getTodosStorage = function () {
  return JSON.parse(localStorage.getItem('data-todos')) || []
}

const todoItemElement = function (todo) {
  return `
      <div class="todo-item" data-id="${todo.id}" data-status="${todo.status}">
        <select
          name="status"
          class="todo-item__status custom"
          data-status="${todo.status}"
          data-id="${todo.id}"
          onchange="handleChangeStatus(this)"
        >
          <option value="open" ${todo.status === STATUS.open && 'selected'}>Todo</option>
          <option value="doing" ${todo.status === STATUS.doing && 'selected'}>Doing</option>
          <option value="completed" ${todo.status === STATUS.completed && 'selected'}>Completed</option>
        </select>
        <div class="todo-item__body">
          <p class="todo-item__content">${todo.title}</p>
          ${todo.due_date && `<span class="todo-item__sub-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ai ai-Schedule"><path d="M9 20H6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4v3"/><path d="M8 2v2"/><path d="M15 2v2"/><path d="M2 8h19"/><path d="M18.5 15.643l-1.5 1.5"/><circle cx="17" cy="17" r="5"/></svg>
            ${todo.due_date}
          </span>`}
        </div>
        <div class="todo-item__action" data-id="${todo.id}" onclick="handleDeleteTodo('${todo.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ai ai-TrashCan"><path d="M4 6h16l-1.58 14.22A2 2 0 0 1 16.432 22H7.568a2 2 0 0 1-1.988-1.78L4 6z"/><path d="M7.345 3.147A2 2 0 0 1 9.154 2h5.692a2 2 0 0 1 1.81 1.147L18 6H6l1.345-2.853z"/><path d="M2 6h20"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
        </div>
        ${todo.status !== STATUS.completed ? `<div class="todo-item__action" data-id="${todo.id}" onclick="handleEditClick('${todo.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ai ai-Edit"><path d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621z"/><path d="M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"/></svg>
        </div>` : ''}
      </div>
    `
}

const editTodoForm = function (todo) {
  const currentDate = (new Date).toISOString().slice(0, 10)
  return `
    <div class="todo-item" data-id="${todo.id}">
      <form class="todo-edit-form" onsubmit="event.preventDefault();handleEditSubmit(event, '${todo.id}');">
        <div class="todo-edit-form-body">
          <div class="todo-edit-form-content mb-1">
            <input class="edit-form__input" name="title" placeholder="Task name" value="${todo.title}"/>
          </div>
          <div class="mb-1">
            <label>Status</label>
            <select name="status" class="todo-item__status status-${todo.status}">
              <option value="open" ${todo.status === STATUS.open && 'selected'}>Todo</option>
              <option value="doing" ${todo.status === STATUS.doing && 'selected'}>Doing</option>
              <option value="completed" ${todo.status === STATUS.completed && 'selected'}>Completed</option>
            </select>
            <label>Due date</label>
            <input class="edit-form__date" type="date" name="due_date" min=${currentDate} value=${todo.due_date} >
          </div>
          <div class="todo-edit-form-action">
            <button
              class="btn primary"
              type="submit"
            >
              Update
            </button>
            <div class="btn btn-delete" onclick="handleDeleteTodo('${todo.id}');">Delete</div>
            <div class="btn" onclick="handleCancelEdit('${todo.id}');">Cancel</div>
          </div>
        </div>
      </form>
    </div>`
}

function renderTodos (datas) {
  const todos = datas || JSON.parse(localStorage.getItem('data-todos'))?.filter(e => e.status !== STATUS.completed) || []
  if (todos.length > 0) {
    todoListDom.innerHTML = todos.reverse().map(todo => todoItemElement(todo)).join('')
  } else {
    todoListDom.innerHTML = noDataContent
  }
}

function checkDueDate () {
  let dataStoreTodos = getTodosStorage();
  let todoOverDue = [];
  dataStoreTodos.filter(e => e.status !== STATUS.completed && e.due_date && e.due_date < currentDate).forEach(e => {
    todoOverDue.push(e.title)
  })
  if (todoOverDue.length > 0) {
    alert(`You have tasks that are overdue\n- ${todoOverDue.join('\n- ')}`)
  }
}

renderTodos();
checkDueDate();

newForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const dataStoreTodos = getTodosStorage();
  let formData = Object.fromEntries(new FormData(e.target));
  if (formData.title.length !== 0) {
    Object.assign(formData, {
      id: generateUid(),
      created_at: Date.now(),
      status: STATUS.open
    })
    todoListDom.insertAdjacentHTML('afterbegin', todoItemElement(formData))
    localStorage.setItem('data-todos', JSON.stringify([...dataStoreTodos, formData]))
    newInput.value = ''
    newInputDate.value = ''
    newInput.focus()
    const noDataElement = document.querySelector('.no-data');
    if (noDataElement) {
      noDataElement.remove()
    }
  }
})

filterSelect.addEventListener('change', (e) => {
  const currentSelected = e.target.value;
  const dataStoreTodos = getTodosStorage();
  let filterTodos = dataStoreTodos;
  switch (currentSelected) {
    case 'todos':
      filterTodos = dataStoreTodos.filter(e => e.status !== STATUS.completed)
      break;
    case 'today':
      filterTodos = dataStoreTodos.filter(e => e.status !== STATUS.completed && (!e.due_date || e.due_date === currentDate))
      break;
    case 'planned':
      filterTodos = dataStoreTodos.filter(e => e.status !== STATUS.completed && e.due_date)
      break;
    case STATUS.open:
      filterTodos = dataStoreTodos.filter(e => e.status === STATUS.open)
      break;
    case STATUS.doing:
      filterTodos = dataStoreTodos.filter(e => e.status === STATUS.doing)
      break;
    case STATUS.completed:
      filterTodos = dataStoreTodos.filter(e => e.status === STATUS.completed)
      break;
    default:
      break;
  }
  renderTodos(filterTodos);
})

function handleChangeStatus(object) {
  const targetTodoItem = document.querySelector(`div.todo-item[data-id="${object.dataset.id}"]`);
  const dataStoreTodos = getTodosStorage();
  const todoToUpdate = dataStoreTodos.find(x => x.id === object.dataset.id);
  if (todoToUpdate) {
    let newTodo = Object.assign(todoToUpdate, {status: object.value});
    let currentIndex = dataStoreTodos.findIndex(e => e.id === newTodo.id)
    dataStoreTodos[currentIndex] = newTodo
    localStorage.setItem('data-todos', JSON.stringify(dataStoreTodos))
    if (object.value !== STATUS.completed) {
      targetTodoItem.insertAdjacentHTML('beforebegin', todoItemElement(newTodo));
    }
    targetTodoItem.remove();
    if (document.querySelectorAll('.todo-item').length === 0) {
      todoListDom.innerHTML = noDataContent
    }
  } else {
    alert("Todo not found.")
  }
}

function handleEditClick(id) {
  const targetElement = document.querySelector(`div.todo-item[data-id="${id}"]`);
  const todos = getTodosStorage();
  const targetTodo = todos.find(x => x.id === id);
  targetElement.insertAdjacentHTML('beforebegin', editTodoForm(targetTodo));
  targetElement.remove();
}

function handleCancelEdit(id) {
  const targetElement = document.querySelector(`div.todo-item[data-id="${id}"]`);
  const dataStoreTodos = getTodosStorage();
  const currentTodo = dataStoreTodos.find(x => x.id === id);
  targetElement.insertAdjacentHTML('beforebegin', todoItemElement(currentTodo));
  targetElement.remove();
}

function handleEditSubmit(e, id) {
  const targetElement = document.querySelector(`div.todo-item[data-id="${id}"]`);
  const dataStoreTodos = getTodosStorage();
  const todoToUpdate = dataStoreTodos.find(x => x.id === id);
  let formData = Object.fromEntries(new FormData(e.target));
  let newTodo;
  if (todoToUpdate) {
    newTodo = Object.assign(todoToUpdate, formData);
    let currentIndex = dataStoreTodos.findIndex(e => e.id === newTodo.id)
    dataStoreTodos[currentIndex] = newTodo
    localStorage.setItem('data-todos', JSON.stringify(dataStoreTodos))
    targetElement.insertAdjacentHTML('beforebegin', todoItemElement(newTodo));
    targetElement.remove();
  } else {
    alert("Todo not found.")
  }
}

function handleDeleteTodo(id) {
  const targetElement = document.querySelector(`div.todo-item[data-id="${id}"]`);
  const dataStoreTodos = getTodosStorage();
  const currentTodo = dataStoreTodos.find(x => x.id === id);
  if (confirm(`Delete "${currentTodo.title}"?`)) {
    let currentIndex = dataStoreTodos.findIndex(e => e.id === currentTodo.id)
    let todosClone = dataStoreTodos.filter((_, i) => i !== currentIndex);
    localStorage.setItem('data-todos', JSON.stringify(todosClone));
    targetElement.remove();

    if (document.querySelectorAll('.todo-item').length === 0) {
      todoListDom.innerHTML = noDataContent
    }
  }
}
