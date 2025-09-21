// Time
const second = 1000
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;
const year = month * 12;

// Elements
const addTaskBtn = document.getElementById('add-task-button');
const clearTaskBtn = document.getElementById('clear-task-button');

const taskInputs = document.querySelectorAll('#add-task-container input, #add-task-container textarea');
const resetInputElement = document.getElementById('reset-input');

const toDoListContainer = document.getElementById('tasks-container');
const toDoList = document.getElementById('to-do-list');

// Folding and unfolding add task folder
const addTaskFolder = document.querySelector("#add-task-folder");

const addTaskIcon = document.querySelector(".add-task-icon");
const addTaskContainer = document.querySelector("#add-task-container");

addTaskFolder.addEventListener("click", () => {
    if (document.querySelector("#add-task-container:hover")) return;

    const showing = addTaskContainer.classList.contains("show");
    if (showing) {
        setTimeout(() => addTaskIcon.classList.add("fa-plus"), 200)
        setTimeout(() => addTaskIcon.classList.remove("fa-minus"), 200)
        addTaskContainer.classList.remove("show");
    } else {
        setTimeout(() => addTaskIcon.classList.remove("fa-plus"), 0)
        setTimeout(() => addTaskIcon.classList.add("fa-minus"), 0)
        addTaskContainer.classList.add("show");
    }
})

// Tasks and Set up here & there
let taskLists = JSON.parse(localStorage.getItem('taskLists')) || {'Default': []}; // Get task lists that are stored in local storage
let currentTaskListId = Object.keys(taskLists)[ Math.floor( Math.random() * Object.keys(taskLists).length + 1 ) - 1 ] || null;
// taskLists.map()
// tasks.map(task => {return {...task, newTask: false}});
console.log(`Tasklists : ${taskLists}, CurrentTaskListId : ${currentTaskListId}`);
const lists = document.getElementById("lists");
Object.keys(taskLists).forEach((id, index) => { // Add task list button
    if (id !== "Default") {
        lists.innerHTML += `<button class="list-card drop-shadow" onclick="selectList(this)">${id}</button>`
    }
});



const fillInZero = (number) => number < 10 && number > -1 ? `0${number}` : `${number}`;

const updateToDoList = () => {
    toDoListContainer.innerHTML = '';

    taskLists[currentTaskListId].forEach((task, index) => {
        const { name, detail, due_date, due_time, newTask } = task;

        // Creating task element
        const div = document.createElement('div');
        div.classList.add(`task`);
        newTask ? div.classList.add('popIn') : false;
        div.innerHTML =`
            <div class="task-heading task-component drop-shadow">
                <h2>${name}</h2>
                <p>${detail}</p>
            </div>
            <p class="task-component task-due">Due : ${due_date} at ${due_time}</p>
            <p class="task-component task-due-in">Loading...</p>
            <div class="task-button task-component">
                <button class="finish" onclick="removeTask(${index})">
                    <i class="fa-solid fa-circle-check fa-xl"></i>
                    Finish
                </button>
                <button class="remove" onclick="removeTask(${index})">
                    <i class="fa-solid fa-circle-xmark fa-xl"></i>
                    Remove
                </button>
                <button class="copy" onclick="copyTask(${index})">
                    <i class="fa-solid fa-copy fa-xl"></i>
                    Copy
                </button>
            </div>
        `;
        
        taskLists[currentTaskListId][index].newTask = false; // Setting the task to not be new anymore

        // Add task element to task container
        const element = toDoListContainer.appendChild(div);
        const dueRelative = [...element.childNodes].find(element => {
                return element.classList ? element.classList.contains("task-due-in") : false
            }) // Find 'due in' element
        
        // Update how much time is left until due time
        setTimeout(updateRelative, 1000);
        function updateRelative() {
            const dateSplit = due_date.split('-');
            const timeSplit = due_time.split(':');

            const nowTime = Date.now();
            const dueTime = new Date(
                dateSplit[0],
                dateSplit[1]-1, // I guess month start at 0
                dateSplit[2],
                timeSplit[0],
                timeSplit[1]
                ).getTime();
            const offsetTime = dueTime - nowTime;

            // Color the time
            if (offsetTime < 1) {
                element.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
                dueRelative.style.backgroundColor = '#ff0000ff'
            } else if (offsetTime < hour) { // Less than an hour left
                dueRelative.style.backgroundColor = '#6f0000ff'
            } else if (offsetTime < hour * 12) { // Less than half a day left
                dueRelative.style.backgroundColor = '#7c4800ff'
            } else if (offsetTime < day) { // Less than a day left
                dueRelative.style.backgroundColor = '#676400ff'
            } else if (offsetTime < day * 7) { // Less than a week left
                dueRelative.style.backgroundColor = '#506d00ff'
            }

            // Calculate the time
            const offsetSeconds = Math.floor((offsetTime % minute) / second);
            const offsetMinutes = Math.floor((offsetTime % hour) / minute);
            const offsetHours = Math.floor((offsetTime % day) / hour);
            const offsetDays = Math.floor((offsetTime % month) / day);
            const offsetMonths = Math.floor((offsetTime % year) / month);

            // Displaying the time
            dueRelative.textContent = `
            ${fillInZero(offsetMonths)} m
            ${fillInZero(offsetDays)} d
            ${fillInZero(offsetHours)} h
            ${fillInZero(offsetMinutes)} m
            ${fillInZero(offsetSeconds)} s`;
            
            setTimeout(updateRelative, 1000);
        }
    });
}
updateToDoList();

function copyTask(index) {
    taskInputs.forEach(input => {
        const appropriateKey = input.id.replace('-input', '').replace('-', '_');
        input.value = taskLists[currentTaskListId][index][appropriateKey];
    });
}

function removeTask(id, index) {
    const task = document.querySelectorAll('.task')[index]; // Get the task element
    
    task.classList.add('removing'); // Add class for animation

    setTimeout(() => {
        taskLists[currentTaskListId].splice(index, 1); // Remove task from the task list

        // Save and update
        localStorage.setItem('taskLists', JSON.stringify(taskLists));
        updateToDoList(id);
    }, 200);

    console.log(`Removing task from ${id} task list`);
}

function addTask() {
    // Check if user has left any inputs blank, if so return and alert user to fill the inputs
    const noInput = [...taskInputs].find(input => input.value === '');
    if (noInput) {
        alert('Please fill in the necessary information!');
        return
    };

    // Create data of the new task
    const taskData = {newTask: true};
    const resetInput = resetInputElement.checked;
    taskInputs.forEach(input => {
        if (input.id === 'reset-input') return;

        const appropriateKey = input.id.replace('-input', '').replace('-', '_');
        taskData[appropriateKey] = input.value;
        
        if (resetInput) input.value = ''; // Reset input field if checkbox is checked
    });
    
    // Add new task to the task list
    taskLists[currentTaskListId].unshift(taskData);

    updateToDoList();

    localStorage.setItem('taskLists', JSON.stringify(taskLists));
    console.log(`Task added to ${currentTaskListId} task list!`);
};

clearTaskBtn.addEventListener('click', () => {
    localStorage.clear();
});

let inputActive = false
function addList(element) {
    if (!inputActive) {
        inputActive = true

        // Add input element
        let inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.placeholder = "silly"

        element.textContent = ''
        inputElement = element.appendChild(inputElement);

        // Detect when user stopped using input
        inputElement.addEventListener("blur", () => {
            inputElement.removeEventListener("blur", () => {})
            inputElement.remove()
            inputActive = false

            element.textContent = "Add List"

            // Add new list to list
            const id = inputElement.value;
            if (id) {
                lists.innerHTML += `<button class="list-card drop-shadow" onclick="selectList(this)">${id}</button>`
                taskLists[id] = [];
                localStorage.setItem('taskLists', JSON.stringify(taskLists));
            }
        })
    }
}

function selectList(element) {
    const id = element.textContent;
    console.log(`Selected task list: ${id} (Was selecting ${currentTaskListId})`)

    if (currentTaskListId !== id) {
        currentTaskListId = id;
        updateToDoList()
    }
}