const tasks = [
    {id: 1, title: "Project Setup", status: "todo", priority: "high", tag: "setup"},
    {id: 2, title: "Create Header", status: "todo", priority: "medium", tag: "ui"},
    {id: 3, title: "Write API", status: "todo", priority: "high", tag: "backend"},
    {id: 4, title: "Add Authentication", status: "in-progress", priority: "high", tag: "security"},
    {id: 5, title: "Design Footer", status: "done", priority: "low", tag: "ui"},
    {id: 6, title: "Fix Cart Bug", status: "todo", priority: "high", tag: "bug"},
    {id: 7, title: "Update Documentation", status: "todo", priority: "low", tag: "docs"},
    {id: 8, title: "Setup CI/CD", status: "done", priority: "medium", tag: "devops"},
    {id: 9, title: "Connect Database", status: "in-progress", priority: "high", tag: "backend"},
    {id: 10, title: "Write Tests", status: "todo", priority: "medium", tag: "qa"}
];

const boardContainer = document.getElementById('kanban-board');
const searchInput = document.getElementById('search-input');
const boardMessage = document.getElementById('board-message');

function render(filterTag = "") {
    document.querySelectorAll('.cards-container').forEach(container => container.textContent = '');
    boardMessage.textContent = "";

    let visibleCards = 0;
    let inProgressCount = 0;
    for (const task of tasks) {
        if (task.status === "in-progress") {
            inProgressCount++;
        }
    }
    document.querySelector('[data-status="in-progress"] .progress-count').textContent = inProgressCount;

    for (const task of tasks) {
        if (filterTag && !task.tag.includes(filterTag.toLowerCase())) continue;

        visibleCards++;

        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.id = task.id;

        const titleEl = document.createElement('h4');
        titleEl.textContent = task.title;

        const tagEl = document.createElement('p');
        tagEl.textContent = `Tag: ${task.tag} | Priority: ${task.priority}`;

        cardEl.appendChild(titleEl);
        cardEl.appendChild(tagEl);

        if (task.status === "todo") {
            const btn = document.createElement('button');
            btn.textContent = "Start Work";
            btn.dataset.action = "move-to-progress";
            cardEl.appendChild(btn);
        } else if (task.status === "in-progress") {
            const btn = document.createElement('button');
            btn.textContent = "Complete";
            btn.dataset.action = "move-to-done";
            cardEl.appendChild(btn);
        }

        const col = document.querySelector(`.column[data-status="${task.status}"] .cards-container`);
        if (col) col.appendChild(cardEl);
    }

    if (visibleCards === 0) {
        boardMessage.textContent = "No tasks found.";
    }
}

boardContainer.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;

    const card = e.target.closest('.card');
    const taskId = parseInt(card.dataset.id);
    const action = e.target.dataset.action;

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (action === "move-to-progress") {
        let currentInProgress = 0;
        for (const t of tasks) {
            if (t.status === "in-progress") currentInProgress++;
        }

        if (currentInProgress >= 3) {
            boardMessage.textContent = "Limit reached! You cannot have more than 3 tasks in progress.";
            return;
        }
        tasks[taskIndex].status = "in-progress";
    } else if (action === "move-to-done") {
        tasks[taskIndex].status = "done";
    }

    render(searchInput.value);
});

searchInput.addEventListener('input', (e) => {
    render(e.target.value);
});

render();