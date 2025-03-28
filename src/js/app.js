document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyList = document.getElementById('emptyList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const dueDateInput = document.getElementById('dueDate');
    const prioritySelect = document.getElementById('prioritySelect');
    const categoryInput = document.getElementById('categoryInput');
    const themeToggle = document.getElementById('themeToggle');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let searchQuery = '';

    // Theme Management
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Local Storage Management
    const updateLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        toggleEmptyListMessage();
    };

    const toggleEmptyListMessage = () => {
        const filteredTasks = filterTasks();
        emptyList.style.display = filteredTasks.length === 0 ? 'block' : 'none';
    };

    // Task Filtering and Sorting
    const filterTasks = () => {
        let filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                task.category?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesFilter = currentFilter === 'all' ||
                                (currentFilter === 'active' && !task.completed) ||
                                (currentFilter === 'completed' && task.completed) ||
                                (currentFilter === 'high' && task.priority === 'high');

            return matchesSearch && matchesFilter;
        });

        // Sort tasks
        switch (sortSelect.value) {
            case 'date':
                filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
                break;
        }

        return filteredTasks;
    };

    // Task Element Creation
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        
        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span>Due: ${formattedDate}</span>
                    ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="complete-btn" title="Mark as complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        const completeBtn = li.querySelector('.complete-btn');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        completeBtn.addEventListener('click', () => {
            task.completed = !task.completed;
            li.classList.toggle('completed');
            updateLocalStorage();
            renderTasks();
        });

        editBtn.addEventListener('click', () => {
            taskInput.value = task.text;
            dueDateInput.value = task.dueDate || '';
            prioritySelect.value = task.priority || 'low';
            categoryInput.value = task.category || '';
            
            // Remove the task being edited
            tasks = tasks.filter(t => t !== task);
            updateLocalStorage();
            renderTasks();
        });

        deleteBtn.addEventListener('click', () => {
            li.classList.add('fade-out');
            setTimeout(() => {
                tasks = tasks.filter(t => t !== task);
                updateLocalStorage();
                renderTasks();
            }, 300);
        });

        return li;
    };

    // Task Rendering
    const renderTasks = () => {
        taskList.innerHTML = '';
        const filteredTasks = filterTasks();
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
        toggleEmptyListMessage();
    };

    // Task Addition
    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            const task = {
                text,
                completed: false,
                id: Date.now(),
                dueDate: dueDateInput.value,
                priority: prioritySelect.value,
                category: categoryInput.value.trim()
            };
            tasks.push(task);
            updateLocalStorage();
            renderTasks();
            
            // Clear inputs
            taskInput.value = '';
            dueDateInput.value = '';
            prioritySelect.value = 'low';
            categoryInput.value = '';
        }
    };

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    sortSelect.addEventListener('change', renderTasks);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // Set minimum date for due date input to today
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.min = today;

    // Initial render
    renderTasks();
});