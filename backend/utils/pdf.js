const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generarPDF(registros, fecha) {
    return new Promise((resolve, reject) => {
        const dir = path.join("./data/pdfs");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, `registros_${fecha}.pdf`);
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Imagen del negocio (ajusta la ruta si es necesario)
        const imgPath = path.join(__dirname, "logo.png");
        if (fs.existsSync(imgPath)) doc.image(imgPath, { width: 100, align: "center" });

        doc.fontSize(18).text("Reporte de Ingresos y Salidas", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${fecha}`);
        doc.moveDown();

        // Tabla
        const tableTop = doc.y;
        const itemHeight = 20;

        doc.font("Helvetica-Bold");
        doc.text("DNI", 50, tableTop);
        doc.text("Nombre", 120, tableTop);
        doc.text("Ingreso", 250, tableTop);
        doc.text("Salida", 350, tableTop);
        doc.text("Horas Trabajadas", 450, tableTop);
        doc.text("Ubic.Ingreso", 550, tableTop);
        doc.text("Ubic.Salida", 650, tableTop);
        doc.font("Helvetica");

        registros.forEach((r, i) => {
            const y = tableTop + itemHeight * (i + 1);
            const ingreso = r.ingreso ? new Date(r.ingreso).toLocaleString("es-AR") : "";
            const salida = r.salida ? new Date(r.salida).toLocaleString("es-AR") : "";
            const horasTrabajadas = r.salida && r.ingreso
                ? new Date(new Date(r.salida) - new Date(r.ingreso)).toISOString().substr(11, 8)
                : "";

            doc.text(r.dni, 50, y);
            doc.text(r.nombre, 120, y);
            doc.text(ingreso, 250, y);
            doc.text(salida, 350, y);
            doc.text(horasTrabajadas, 450, y);

            if (r.ubicacion) {
                doc.fillColor("blue").text("Ver", 550, y, {
                    link: `https://www.google.com/maps?q=${r.ubicacion.lat},${r.ubicacion.lon}`,
                    underline: true
                });
            }

            if (r.ubicacionSalida) {
                doc.fillColor("blue").text("Ver", 650, y, {
                    link: `https://www.google.com/maps?q=${r.ubicacionSalida.lat},${r.ubicacionSalida.lon}`,
                    underline: true
                });
            }
            doc.fillColor("black");
        });

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
}

module.exports = { generarPDF };
