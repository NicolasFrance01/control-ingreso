const backendURL = "https://control-ingreso.onrender.com";
const container = document.querySelector('.container');
const loginBox = document.querySelector('.form-box.login');
const dashboardBox = document.querySelector('.form-box.dashboard');
const pdfBtn = document.getElementById("pdfBtn");
const error = document.getElementById("error");
const status = document.getElementById("status");

// LOGIN
async function login() {
    const dni = document.getElementById("username").value;
    const clave = document.getElementById("password").value;
    try {
        navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await fetch(`${backendURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni, clave, lat, lng })
        });

        const data = await res.json();

        if (data.ok) {
            container.classList.add("active");
            setTimeout(() => {
            loginBox.classList.add("hidden");
            dashboardBox.classList.remove("hidden");

            status.textContent = `Ingreso registrado ✅ (${new Date(data.registro.ingreso).toLocaleTimeString()})`;

            window.currentRegistro = data.registro;

            if (dni === "41847034") pdfBtn.classList.remove("hidden");
            }, 600); // coincide con la animación
        } else { error.textContent = data.msg; }
        }, () => { error.textContent = "Debes permitir la ubicación para ingresar."; });
    } catch (err) { console.error(err); error.textContent = "Error conectando con el servidor"; }
}

// LOGOUT
function logout() {
    container.classList.remove("active");
    loginBox.classList.remove("hidden");
    dashboardBox.classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    error.textContent = "";
    status.textContent = "";
    pdfBtn.classList.add("hidden");
    window.currentRegistro = null;
}

// REGISTRAR INGRESO
function registrarIngreso() {
    if (!window.currentRegistro) return;
    status.textContent = `Ingreso registrado ✅ (${new Date().toLocaleTimeString()})`;
}

// REGISTRAR SALIDA
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
        status.textContent = `Salida registrada ✅ (${new Date(data.registro.salida).toLocaleTimeString()})`;
        } else {
        status.textContent = "❌ " + data.msg;
        }
    } catch (err) { console.error(err); status.textContent = "❌ Error conectando con el servidor"; }
}

// DESCARGAR PDF
function descargarPDF() { window.open(`${backendURL}/generar-pdf`, "_blank"); }
