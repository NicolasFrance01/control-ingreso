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

            // Guardamos info del registro para registrar salida
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
    window.currentRegistro = null;
}

async function registrarIngreso() {
    if (!window.currentRegistro) return;

    document.getElementById("status").textContent = "Ingreso registrado ✅";

    // Opcional: enviar un fetch al backend si querés guardar algo extra
}

async function registrarSalida() {
    if (!window.currentRegistro) return;
    try {
        const res = await fetch(`${backendURL}/salida`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni: window.currentRegistro.dni })
        });
        const data = await res.json();
        if (data.ok) {
            document.getElementById("status").textContent = `Salida registrada: ${new Date(data.registro.salida).toLocaleTimeString()}`;
        } else {
            document.getElementById("status").textContent = data.msg;
        }
    } catch (err) {
        console.error(err);
        document.getElementById("status").textContent = "Error conectando con el servidor";
    }
}
