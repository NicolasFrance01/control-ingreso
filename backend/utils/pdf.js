const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generarPDF(registros, fecha) {
    return new Promise((resolve, reject) => {
        const dir = path.join("./data/pdfs");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, `registros_${fecha}.pdf`);
        const doc = new PDFDocument({ margin: 30 });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Título
        doc.fontSize(18).text("Reporte de Ingresos y Salidas", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${fecha}`);

        doc.moveDown();

        registros.forEach(r => {
            const ingreso = r.ingreso ? new Date(r.ingreso) : null;
            const salida = r.salida ? new Date(r.salida) : null;

            let tiempoTrabajado = "Pendiente";
            if (ingreso && salida) {
                const diffMs = salida - ingreso;
                const horas = Math.floor(diffMs / (1000 * 60 * 60));
                const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
                tiempoTrabajado = `${horas}h ${minutos}m ${segundos}s`;
            }

            doc.moveDown();
            doc.text(`DNI: ${r.dni} | Nombre: ${r.nombre}`);
            doc.text(`Ingreso: ${ingreso ? ingreso.toLocaleString("es-AR") : "No registrado"}`);
            doc.text(`Salida: ${salida ? salida.toLocaleString("es-AR") : "Pendiente"}`);
            doc.text(`Horas trabajadas: ${tiempoTrabajado}`);
            doc.text(`IP: ${r.ip}`);

            // Enlace a Maps si tiene ubicación guardada
            if (r.lat && r.lng) {
                const urlMaps = `https://www.google.com/maps?q=${r.lat},${r.lng}`;
                doc.fillColor("blue").text("Ver ubicación en Maps", { link: urlMaps, underline: true });
                doc.fillColor("black");
            }
        });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

module.exports = { generarPDF };
