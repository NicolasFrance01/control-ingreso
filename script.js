const backendURL = "https://control-ingreso.onrender.com"; // URL de tu backend en Render

async function login() {
    const dni = document.getElementById("username").value;
    const clave = document.getElementById("password").value;
    const error = document.getElementById("error");

    try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const ubicacionIngreso = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            const res = await fetch(`${backendURL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni, clave, ubicacionIngreso })
            });

            const data = await res.json();

            if (data.ok) {
                document.getElementById("login-container").classList.add("hidden");
                document.getElementById("dashboard-container").classList.remove("hidden");

                // Mostrar mensaje con horario de ingreso
                document.getElementById("status").textContent =
                    `Ingreso correcto: ${new Date(data.registro.ingreso).toLocaleTimeString()}`;

                // Guardamos info del registro para registrar salida
                window.currentRegistro = data.registro;

                // Mostrar botón de generar PDF SOLO si es el usuario 41847034
                if (String(dni) === "41847034") {
                    const pdfBtn = document.createElement("button");
                    pdfBtn.textContent = "📄 Generar PDF del día";
                    pdfBtn.onclick = () => {
                        window.open(`${backendURL}/generar-pdf`, "_blank");
                    };
                    document.getElementById("dashboard-container").appendChild(pdfBtn);
                }
            } else {
                error.textContent = data.msg;
            }
        }, () => {
            error.textContent = "Debes permitir la ubicación para ingresar";
        });
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

async function registrarSalida() {
    if (!window.currentRegistro) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const ubicacionSalida = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        try {
            const res = await fetch(`${backendURL}/salida`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni: window.currentRegistro.dni, ubicacionSalida })
            });
            const data = await res.json();
            if (data.ok) {
                document.getElementById("status").textContent =
                    `Salida registrada: ${new Date(data.registro.salida).toLocaleTimeString()}`;
                window.currentRegistro = null;
            } else {
                document.getElementById("status").textContent = data.msg;
            }
        } catch (err) {
            console.error(err);
            document.getElementById("status").textContent = "Error conectando con el servidor";
        }
    }, () => {
        document.getElementById("status").textContent = "Salida registrada sin ubicación ❌";
    });
}
