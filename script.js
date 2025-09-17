const backendURL = "https://control-ingreso.onrender.com";

// LOGIN
async function login() {
  const dni = document.getElementById("username").value;
  const clave = document.getElementById("password").value;
  const error = document.getElementById("error");

  try {
    // pedimos ubicación antes de loguear
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
        // Animación: ocultar login y mostrar dashboard
        const loginBox = document.getElementById("login-container");
        const dashboardBox = document.getElementById("dashboard-container");

        loginBox.classList.add("hidden");
        setTimeout(() => {
          loginBox.style.display = "none";
          dashboardBox.style.display = "flex";
          setTimeout(() => dashboardBox.classList.remove("hidden"), 50);
        }, 300);

        // Mensaje de ingreso ✅
        document.getElementById("status").textContent =
          `Ingreso registrado ✅ (${new Date(data.registro.ingreso).toLocaleTimeString()})`;

        // Guardamos info del registro
        window.currentRegistro = data.registro;

        // botón PDF solo para DNI 41847034
        if (dni === "41847034") {
          document.getElementById("pdfBtn").classList.remove("hidden");
        }
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
}

// LOGOUT
function logout() {
  const loginBox = document.getElementById("login-container");
  const dashboardBox = document.getElementById("dashboard-container");

  dashboardBox.classList.add("hidden");
  setTimeout(() => {
    dashboardBox.style.display = "none";
    loginBox.style.display = "flex";
    setTimeout(() => loginBox.classList.remove("hidden"), 50);
  }, 300);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("error").textContent = "";
  document.getElementById("status").textContent = "";
  window.currentRegistro = null;
  document.getElementById("pdfBtn").classList.add("hidden");
}

// REGISTRAR INGRESO manual
async function registrarIngreso() {
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
