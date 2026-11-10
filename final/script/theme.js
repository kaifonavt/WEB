const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-bs-theme', currentTheme);
updateIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    let theme = htmlElement.getAttribute('data-bs-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';

    htmlElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

function updateIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill fs-5 text-warning';
    } else {
        themeIcon.className = 'bi bi-moon-fill fs-5 text-dark';
    }
}