document.addEventListener('DOMContentLoaded', function() {  
	const todoForm = document.getElementById('todo-form');  
	const todoInput = document.getElementById('todo-input');  
	const todoList = document.getElementById('todo-list');  
ECHO is on.
	todoForm.addEventListener('submit', function(e) {  
		e.preventDefault();  
		const task = todoInput.value.trim();  
		if (task) {  
			addTodo(task);  
			todoInput.value = '';  
		}  
	});  
ECHO is on.
	function addTodo(task) {  
		const li = document.createElement('li');  
		li.textContent = task;  
		const btn = document.createElement('button');  
		btn.textContent = 'Delete';  
		btn.className = 'delete-btn';  
		btn.onclick = function() { li.remove(); };  
		li.appendChild(btn);  
		todoList.appendChild(li);  
	}  
}); 
