const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generarPDF(registros, fecha) {
    return new Promise((resolve, reject) => {
    const dir = path.join("./data/pdfs");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `registros_${fecha}.pdf`);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text("Reporte de Ingresos", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${fecha}`);

    registros.forEach(r => {
        doc.moveDown();
        doc.text(`DNI: ${r.dni} | Nombre: ${r.nombre}`);
        doc.text(`Ingreso: ${r.ingreso}`);
        doc.text(`IP/Ubicación: ${r.ip}`);
        });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

module.exports = { generarPDF };
