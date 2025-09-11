const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { generarPDF } = require("./utils/pdf");

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_PATH = process.env.STORAGE_PATH || "./data";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://nicolasfrance01.github.io";

app.use(cors({ origin: FRONTEND_URL }));
app.use(bodyParser.json());

// cargar usuarios (simulación sin BD)
const usuarios = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));

// login
app.post("/login", (req, res) => {
    const { dni, clave } = req.body;
    const user = usuarios.find(u => u.dni === dni && u.clave === clave);

    if (!user) return res.status(401).json({ ok: false, msg: "DNI o clave incorrectos" });

    const registro = {
        dni,
        nombre: user.nombre,
        ingreso: new Date().toISOString(),
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress
    };

    // crear carpeta STORAGE_PATH si no existe
    if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH, { recursive: true });

    const hoy = new Date().toISOString().split("T")[0];
    const archivo = path.join(STORAGE_PATH, `registros_${hoy}.json`);
    let data = [];
    if (fs.existsSync(archivo)) data = JSON.parse(fs.readFileSync(archivo));
    data.push(registro);
    fs.writeFileSync(archivo, JSON.stringify(data, null, 2));

    res.json({ ok: true, msg: "Ingreso correcto", registro });
});

// registrar salida
app.post("/salida", (req, res) => {
    const { dni, ubicacionSalida } = req.body;
    const hoy = new Date().toISOString().split("T")[0];
    const archivo = path.join(STORAGE_PATH, `registros_${hoy}.json`);
    if (!fs.existsSync(archivo)) return res.status(404).json({ ok: false, msg: "No hay registros de hoy" });

    const data = JSON.parse(fs.readFileSync(archivo));
    const registro = data.find(r => r.dni === dni && !r.salida);
    if (!registro) return res.status(404).json({ ok: false, msg: "No se encontró el ingreso del usuario" });

    registro.salida = new Date().toISOString();
    registro.ubicacionSalida = ubicacionSalida;

    fs.writeFileSync(archivo, JSON.stringify(data, null, 2));
    res.json({ ok: true, msg: "Salida registrada", registro });
});

// generar pdf del día
app.get("/pdf", async (req, res) => {
    try {
        const fecha = req.query.fecha;
        const archivo = path.join(STORAGE_PATH, `registros_${fecha}.json`);
        if (!fs.existsSync(archivo)) return res.status(404).json({ ok: false, msg: "No hay registros" });

        const registros = JSON.parse(fs.readFileSync(archivo));
        const pdfPath = await generarPDF(registros, fecha);

        res.download(pdfPath);
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, msg: "Error generando PDF" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
});


