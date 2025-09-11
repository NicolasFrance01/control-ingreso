const backendURL = "https://control-ingreso.onrender.com"; // URL de tu backend en Render

async function login() {
    const dni = document.getElementById("username").value;
    const clave = document.getElementById("password").value;
    const error = document.getElementById("error");

    try {
        const res = await fetch(`${backendURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni, clave })
        });

        const data = await res.json();

        if (data.ok) {
            document.getElementById("login-container").classList.add("hidden");
            document.getElementById("dashboard-container").classList.remove("hidden");

            // Mostrar mensaje con horario de ingreso
            document.getElementById("status").textContent = `Ingreso correcto: ${new Date(data.registro.ingreso).toLocaleTimeString()}`;

            // Guardamos info del registro si necesitás para registrar salida o captura
            window.currentRegistro = data.registro;
        } else {
            error.textContent = data.msg;
        }
    } catch (err) {
        console.error(err);
        error.textContent = "Error conectando con el servidor";
    }
}

function logout() {
    document.getElementById("dashboard-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("error").textContent = "";
    document.getElementById("status").textContent = "";
}

async function registrarIngreso() {
    if (!window.currentRegistro) return;
    document.getElementById("status").textContent = "Ingreso registrado ✅";
    // Aquí podrías hacer fetch a un endpoint de registro de ingreso si quieres guardar algo extra
}

async function registrarSalida() {
    if (!window.currentRegistro) return;
    document.getElementById("status").textContent = "Salida registrada ✅";
    // Aquí podrías hacer fetch a un endpoint de salida para guardar la hora final
}
