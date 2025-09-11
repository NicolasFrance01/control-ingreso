const backendURL = "https://control-ingreso.onrender.com";

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
            window.currentRegistro = data.registro;

            // 🔑 Mostrar botón PDF solo si el usuario es admin o 41847034
            if (dni === "admin" || dni === "41847034") {
                document.getElementById("btn-pdf").classList.remove("hidden");
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
}

async function registrarIngreso() {
    if (!window.currentRegistro) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
        window.currentRegistro.ubicacion = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        document.getElementById("status").textContent = "Ingreso registrado ✅";

        await fetch(`${backendURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.currentRegistro)
        });
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

// 📄 Descargar PDF
document.getElementById("btn-pdf").addEventListener("click", async () => {
    const hoy = new Date().toISOString().split("T")[0];
    const url = `${backendURL}/pdf?fecha=${hoy}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudo generar el PDF");

        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_${hoy}.pdf`;
        link.click();
    } catch (err) {
        alert("Error descargando PDF: " + err.message);
    }
});
