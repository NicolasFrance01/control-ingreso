const backendURL = "https://control-ingreso.onrender.com";
const container = document.getElementById("main-container");

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dni = document.getElementById("username").value;
  const clave = document.getElementById("password").value;
  const error = document.getElementById("error");

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
        error.textContent = "";

        // animación
        container.classList.add("active");

        setTimeout(() => {
          document.getElementById("login-container").classList.add("hidden");
          document.getElementById("dashboard-container").classList.remove("hidden");

          document.getElementById("status").textContent =
            `Ingreso registrado ✅ (${new Date(data.registro.ingreso).toLocaleTimeString()})`;

          window.currentRegistro = data.registro;

          if (dni === "41847034") {
            document.getElementById("pdfBtn").classList.remove("hidden");
          }
        }, 800);
      } else {
        error.textContent = data.msg;
      }
    }, () => {
      error.textContent = "Debes permitir la ubicación para ingresar.";
    });
  } catch (err) {
    console.error(err);
    error.textContent = "Error conectando con el servidor";
  }
});

// LOGOUT
function logout() {
  container.classList.remove("active");
  document.getElementById("dashboard-container").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("error").textContent = "";
  document.getElementById("status").textContent = "";
  window.currentRegistro = null;
  document.getElementById("pdfBtn").classList.add("hidden");
}

// REGISTRAR INGRESO
function registrarIngreso() {
  if (!window.currentRegistro) return;
  document.getElementById("status").textContent =
    `Ingreso registrado ✅ (${new Date().toLocaleTimeString()})`;
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
      document.getElementById("status").textContent =
        `Salida registrada ✅ (${new Date(data.registro.salida).toLocaleTimeString()})`;
    } else {
      document.getElementById("status").textContent = "❌ " + data.msg;
    }
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "❌ Error conectando con el servidor";
  }
}

// DESCARGAR PDF
function descargarPDF() {
  window.open(`${backendURL}/generar-pdf`, "_blank");
}
