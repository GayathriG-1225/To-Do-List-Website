
// ======================================
// 1. SELECT HTML ELEMENTS
// ======================================

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");

const formError = document.getElementById("formError");

const clearCompletedBtn = document.getElementById(
    "clearCompleted"
);


// ======================================
// 2. TASK DATA
// ======================================

// Load previously saved tasks from Local Storage

let tasks = [];

try {
    const savedTasks = localStorage.getItem("taskflowTasks");

    tasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.error("Unable to load saved tasks:", error);

    tasks = [];

}


// Current filter

let currentFilter = "all";


// ======================================
// 3. SAVE TASKS TO LOCAL STORAGE
// ======================================

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


// ======================================
// 4. ESCAPE HTML CONTENT
// ======================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, (character) => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// ======================================
// 5. ADD NEW TASK
// ======================================

function addTask(event) {

    event.preventDefault();

    const taskName = taskInput.value.trim();


    // Validate input

    if (taskName === "") {

        formError.textContent = "Please enter a task!";

        taskInput.focus();

        return;

    }


    if (taskName.length < 3) {

        formError.textContent =
            "Task must contain at least 3 characters.";

        taskInput.focus();

        return;

    }


    // Create task object

    const newTask = {

        id: Date.now() + Math.random(),

        title: taskName,

        completed: false,

        createdAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })

    };


    // Add task to array

    tasks.unshift(newTask);


    // Save and update UI

    saveTasks();

    renderTasks();

    updateStatistics();


    // Reset input

    taskInput.value = "";

    formError.textContent = "";

    taskInput.focus();

}


// ======================================
// 6. DISPLAY TASKS
// ======================================

function renderTasks() {

    taskList.innerHTML = "";


    // Filter tasks based on selection

    let filteredTasks = tasks.filter((task) => {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;

    });


    // Display empty state

    if (filteredTasks.length === 0) {

        emptyState.classList.add("show");

        if (currentFilter === "completed" && tasks.length > 0) {

            emptyState.querySelector("h3").textContent =
                "No completed tasks!";

            emptyState.querySelector("p").textContent =
                "Complete a task to see it here.";

        } else if (
            currentFilter === "pending" && tasks.length > 0
        ) {

            emptyState.querySelector("h3").textContent =
                "All caught up!";

            emptyState.querySelector("p").textContent =
                "You have no pending tasks.";

        } else {

            emptyState.querySelector("h3").textContent =
                "No tasks yet!";

            emptyState.querySelector("p").textContent =
                "Add your first task and start being productive.";

        }

    } else {

        emptyState.classList.remove("show");

    }


    // Generate task cards

    filteredTasks.forEach((task) => {

        const taskCard = document.createElement("div");

        taskCard.className = task.completed
            ? "task-card completed"
            : "task-card";


        taskCard.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                data-action="toggle"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark ${escapeHTML(task.title)} as completed"
            >

            <div class="task-info">

                <h3>${escapeHTML(task.title)}</h3>

                <p>Created on ${escapeHTML(task.createdAt)}</p>

            </div>

            <div class="task-actions">

                <button
                    class="action-btn edit-btn"
                    data-action="edit"
                    data-id="${task.id}"
                    aria-label="Edit task"
                    title="Edit task">
                    ✎
                </button>

                <button
                    class="action-btn delete-btn"
                    data-action="delete"
                    data-id="${task.id}"
                    aria-label="Delete task"
                    title="Delete task">
                    ✕
                </button>

            </div>

        `;


        taskList.appendChild(taskCard);

    });


    // Update filter button styles

    document.querySelectorAll(".filter-btn").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });

    document.querySelectorAll(".nav-item").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });

}


// ======================================
// 7. EDIT TASK
// ======================================

function editTask(id) {

    const task = tasks.find((item) => item.id === id);

    if (!task) return;


    const updatedTask = prompt(
        "Edit your task:",
        task.title
    );


    // Cancel editing

    if (updatedTask === null) {
        return;
    }


    const newTitle = updatedTask.trim();


    if (newTitle.length < 3) {

        alert("Task must contain at least 3 characters.");

        return;

    }


    // Update task

    task.title = newTitle;


    saveTasks();

    renderTasks();

    updateStatistics();

}


// ======================================
// 8. DELETE TASK
// ======================================

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }


    tasks = tasks.filter((task) => task.id !== id);


    saveTasks();

    renderTasks();

    updateStatistics();

}


// ======================================
// 9. MARK TASK AS COMPLETED
// ======================================

function toggleTask(id) {

    const task = tasks.find((item) => item.id === id);

    if (!task) return;


    // Change completion status

    task.completed = !task.completed;


    saveTasks();

    renderTasks();

    updateStatistics();

}


// ======================================
// 10. HANDLE TASK ACTIONS
// ======================================

taskList.addEventListener("click", (event) => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;


    const id = Number(button.dataset.id);

    const action = button.dataset.action;


    if (action === "edit") {

        editTask(id);

    }

    if (action === "delete") {

        deleteTask(id);

    }

});


// Handle checkbox changes separately

taskList.addEventListener("change", (event) => {

    if (event.target.matches('[data-action="toggle"]')) {

        const id = Number(event.target.dataset.id);

        toggleTask(id);

    }

});


// ======================================
// 11. FILTER TASKS
// ======================================

function filterTasks(filter) {

    currentFilter = filter;

    renderTasks();

}


// Sidebar filters

document.querySelectorAll(".nav-item").forEach((button) => {

    button.addEventListener("click", () => {

        filterTasks(button.dataset.filter);

    });

});


// Task list filters

document.querySelectorAll(".filter-btn").forEach((button) => {

    button.addEventListener("click", () => {

        filterTasks(button.dataset.filter);

    });

});


// ======================================
// 12. UPDATE STATISTICS
// ======================================

function updateStatistics() {

    const total = tasks.length;


    const completed = tasks.filter((task) => {

        return task.completed;

    }).length;


    const pending = total - completed;


    // Dashboard statistics

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("completedTasks").textContent = completed;


    // Sidebar counts

    document.getElementById("allCount").textContent = total;

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("completedCount").textContent = completed;


    // Calculate progress percentage

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    document.getElementById("progressPercentage").textContent =
        percentage + "%";


    document.getElementById("progressBar").style.width =
        percentage + "%";

}


// ======================================
// 13. CLEAR COMPLETED TASKS
// ======================================

clearCompletedBtn.addEventListener("click", () => {

    const completedTasks = tasks.filter(
        (task) => task.completed
    );

    if (completedTasks.length === 0) {

        alert("There are no completed tasks to clear.");

        return;

    }


    const confirmClear = confirm(
        "Are you sure you want to clear all completed tasks?"
    );


    if (!confirmClear) return;


    tasks = tasks.filter((task) => !task.completed);


    saveTasks();

    renderTasks();

    updateStatistics();

});


// ======================================
// 14. DISPLAY CURRENT DATE
// ======================================

const currentDate = document.getElementById("currentDate");

currentDate.textContent = new Date().toLocaleDateString(
    "en-IN",
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
);


// ======================================
// 15. FORM EVENT
// ======================================

taskForm.addEventListener("submit", addTask);


// Clear validation error while typing

taskInput.addEventListener("input", () => {

    formError.textContent = "";

});


// ======================================
// 16. INITIALIZE APPLICATION
// ======================================

function initializeApp() {

    renderTasks();

    updateStatistics();

}


// Start the application

initializeApp();
