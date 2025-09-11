// Usuario y contraseña simulados
const USER = "admin";
const PASS = "1234";

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("error");

    if (user === USER && pass === PASS) {
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("dashboard-container").classList.remove("hidden");
    } else {
        error.textContent = "Usuario o contraseña incorrectos";
    }
}

function logout() {
    document.getElementById("dashboard-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("error").textContent = "";
}

function registrarIngreso() {
    document.getElementById("status").textContent = "Ingreso registrado ✅";
}

function registrarSalida() {
    document.getElementById("status").textContent = "Salida registrada ✅";
}
