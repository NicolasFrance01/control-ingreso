const container = document.querySelector('.container');

function mostrarDashboard() {
    container.classList.add('active');
    document.querySelector('.login').classList.add('hidden');
    document.querySelector('.dashboard').classList.remove('hidden');
}

function mostrarLogin() {
    container.classList.remove('active');
    document.querySelector('.dashboard').classList.add('hidden');
    document.querySelector('.login').classList.remove('hidden');
}
