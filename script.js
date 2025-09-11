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

            document.getElementById("status").textContent = `Ingreso correcto: ${new Date(data.registro.ingreso).toLocaleTimeString()}`;

            // Guardamos info del registro
            window.currentRegistro = data.registro;

            // Solo mostrar botón de PDF si es el usuario con DNI 41847034
            if (String(data.registro.dni) === "41847034") {
                document.getElementById("pdf-button").classList.remove("hidden");
            }
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
    document.getElementById("pdf-button").classList.add("hidden");
}

async function registrarIngreso() {
    if (!window.currentRegistro) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const ubicacionIngreso = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // Guardamos ubicación en el backend
        const res = await fetch(`${backendURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dni: window.currentRegistro.dni,
                clave: window.currentRegistro.clave, // si querés mandar la clave de nuevo
                ubicacionIngreso
            })
        });

        const data = await res.json();

        if (data.ok) {
            document.getElementById("status").textContent = "Ingreso registrado ✅";
            window.currentRegistro = data.registro; // guardamos también la ubicación
        } else {
            document.getElementById("status").textContent = data.msg;
        }

    }, () => {
        document.getElementById("status").textContent = "Ingreso registrado sin ubicación ❌";
    });
}

async function registrarSalida() {
    if (!window.currentRegistro) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const ubicacionSalida = { lat: pos.coords.latitude, lon: pos.coords.longitude };

        const res = await fetch(`${backendURL}/salida`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni: window.currentRegistro.dni, ubicacionSalida })
        });
        const data = await res.json();
        if (data.ok) {
            document.getElementById("status").textContent = `Salida registrada: ${new Date(data.registro.salida).toLocaleTimeString()}`;
            window.currentRegistro = null;
        } else {
            document.getElementById("status").textContent = data.msg;
        }
    }, () => {
        document.getElementById("status").textContent = "Salida registrada sin ubicación ❌";
    });
}

// Descargar PDF
function descargarPDF() {
    const hoy = new Date().toISOString().split("T")[0];
    window.open(`${backendURL}/pdf?fecha=${hoy}`, "_blank");
}


