// Récupère l'élément HTML qui a un ID de 'todoform' et le stocke dans une constante appelée 'form'
const form = document.getElementById('todoform');

// Récupère l'élément HTML qui a un ID de 'newtodo' et le stocke dans une constante appelée 'todoInput'
const todoInput = document.getElementById('newtodo');

// Récupère l'élément HTML qui a un ID de 'todos-list' et le stocke dans une constante appelée 'todosListEl'
const todosListEl = document.getElementById('todos-list');

// Récupère le premier élément HTML qui correspond au sélecteur de classe '.notification' et le stocke dans une constante appelée 'notificationEl'
const notificationEl = document.querySelector('.notification');

// Récupère l'objet 'todos' stocké dans 'localStorage', le parse en utilisant la méthode 'JSON.parse' et le stocke dans une variable appelée 'todos'
// Si aucun objet 'todos' n'est trouvé dans 'localStorage', 'todos' sera initialisé à une valeur vide
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initialise la variable 'EditTodoId' à la valeur -1
let EditTodoId = -1;


// Affiche la liste des tâches 'todos' sur la page
renderTodos();

// Ajoute un gestionnaire d'évènement 'submit' à l'élément 'form' qui exécute la fonction anonyme suivante chaque fois que le formulaire est soumis
form.addEventListener('submit', function (event) {

  // Empêche le comportement par défaut du formulaire (recharge de la page)
  event.preventDefault();

  // Enregistre la nouvelle tâche et met à jour l'affichage de la liste des tâches
  saveTodo();
  renderTodos();

  // Enregistre la liste mise à jour des tâches dans 'localStorage' sous forme de chaîne de caractères JSON
  localStorage.setItem('todos', JSON.stringify(todos));
});

// Enregistre une nouvelle tâche dans la liste 'todos'
function saveTodo() {
  // Récupère la valeur saisie dans l'élément 'todoInput'
  const todoValue = todoInput.value;

  // Vérifie si la tâche est vide
  const isEmpty = todoValue === '';

  // Vérifie s'il existe une tâche similaire dans la liste
  const isDuplicate = todos.some((todo) => todo.value.toUpperCase() === todoValue.toUpperCase());

  // Si la tâche est vide, affiche une notification
  if (isEmpty) {
    afficherNotification("L’entrée de Todo est vide");
  }
  // Si la tâche existe déjà, affiche une notification
  else if (isDuplicate) {
    afficherNotification('Todo existe déjà !');
  }
  // Sinon, enregistre la tâche dans la liste 'todos'
  else {
    // Si l'ID de l'élément en cours d'édition est défini (supérieur ou égal à 0), met à jour l'élément en utilisant l'ID
    // et remet l'ID de l'élément en cours d'édition à sa valeur initiale (-1)
    if (EditTodoId >= 0) {
      todos = todos.map((todo, index) => ({
        ...todo,
        value: index === EditTodoId ? todoValue : todo.value,
      }));
      EditTodoId = -1;
    }
    // Sinon, ajoute une nouvelle tâche à la liste 'todos' avec la valeur saisie, un état non coché et une couleur aléatoire
    else {
      todos.push({
        value: todoValue,
        checked: false,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      });
    }

    // Réinitialise la valeur de l'élément 'todoInput'
    todoInput.value = '';
  }
}

// Affiche la liste des tâches 'todos' sur la page
function renderTodos() {
  // Si la liste 'todos' est vide, affiche un message et quitte la fonction
  if (todos.length === 0) {
    todosListEl.innerHTML = '<center>Rien à faire!</center>';
    return;
  }

  // Vide l'élément 'todosListEl' avant de le réafficher
  todosListEl.innerHTML = '';

  // Parcourt la liste 'todos' et ajoute chaque tâche à l'élément 'todosListEl'
  todos.forEach((todo, index) => {
    todosListEl.innerHTML += `
    <div class="todo" id=${index}>
      <i 
        class="bi ${todo.checked ? 'bi-check-circle-fill' : 'bi-circle'}"
        style="color : ${todo.color}"
        data-action="check"
      ></i>
      <p class="${todo.checked ? 'checked' : ''}" data-action="check">${todo.value}</p>
      <i class="bi bi-pencil-square" data-action="edit"></i>
      <i class="bi bi-trash" data-action="delete"></i>
    </div>
    `;
  });
}


// Ajoute un gestionnaire d'évènement 'click' à l'élément 'todosListEl' qui exécute la fonction anonyme suivante chaque fois qu'un élément de la liste est cliqué
todosListEl.addEventListener('click', (event) => {
  // Récupère l'élément cible du clic
  const target = event.target;

  // Récupère le noeud parent de l'élément cible
  const parentElement = target.parentNode;

  // Si le noeud parent n'est pas une tâche (classe 'todo'), quitte la fonction
  if (parentElement.className !== 'todo') return;

  // Récupère le noeud de la tâche
  const todo = parentElement;

  // Récupère l'ID de la tâche (en le convertissant en nombre)
  const todoId = Number(todo.id);

  // Récupère l'action à effectuer (définie dans l'attribut 'data-action' de l'élément cible)
  const action = target.dataset.action;

  // Exécute l'action correspondante en fonction de la valeur de 'action'
  action === 'check' && checkTodo(todoId);
  action === 'edit' && editTodo(todoId);
  action === 'delete' && supprimerTodo(todoId);
});

// Coche ou décoche une tâche en fonction de son ID
function checkTodo(todoId) {
  // Met à jour la propriété 'checked' de la tâche en utilisant son ID
  todos = todos.map((todo, index) => ({
    ...todo,
    checked: index === todoId ? !todo.checked : todo.checked,
  }));

  // Affiche à nouveau la liste des tâches
  renderTodos();

  // Enregistre la liste mise à jour des tâches dans 'localStorage' sous forme de chaîne de caractères JSON
  localStorage.setItem('todos', JSON.stringify(todos));
}


// Prépare l'édition d'une tâche en fonction de son ID
function editTodo(todoId) {
  // Remplit l'élément 'todoInput' avec la valeur de la tâche à éditer
  todoInput.value = todos[todoId].value;

  // Enregistre l'ID de la tâche en cours d'édition
  EditTodoId = todoId;
}


// SUPPRIMER TACHE A FAIRE
function supprimerTodo(idTodo) {
  // Filtre la liste des tâches à faire en ne conservant que celles dont l'index ne correspond pas à l'identifiant de la tâche à supprimer
  todos = todos.filter((todo, index) => index !== idTodo);
  // Réinitialise la valeur de EditTodoId
  EditTodoId = -1;

  // Met à jour l'affichage de la liste de tâches à faire
  renderTodos();
  // Enregistre la liste mise à jour des tâches à faire dans le stockage local
  localStorage.setItem('todos', JSON.stringify(todos));
}


// AFFICHER UNE NOTIFICATION
function afficherNotification(msg) {
  // Change le message
  notificationEl.innerHTML = msg;

  // Ajoute la classe "notif-enter" à l'élément de notification
  notificationEl.classList.add('notif-enter');

  // Retire la classe "notif-enter" de l'élément de notification après 2 secondes
  setTimeout(() => {
    notificationEl.classList.remove('notif-enter');
  }, 2000);
}

