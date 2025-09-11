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

    // Título
    doc.fontSize(18).text("Reporte de Ingresos y Salidas", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${fecha}`);
    doc.moveDown(1.5);

    const opcionesHora = { timeZone: "America/Argentina/Buenos_Aires", hour12: false };

    // Encabezado tipo tabla
    doc.font("Helvetica-Bold");
    doc.text("DNI", 30, doc.y, { width: 70 });
    doc.text("Nombre", 110, doc.y, { width: 120 });
    doc.text("Ingreso", 240, doc.y, { width: 100 });
    doc.text("Salida", 350, doc.y, { width: 100 });
    doc.text("Horas Trab.", 460, doc.y, { width: 70 });
    doc.text("IP", 540, doc.y, { width: 120 });
    doc.text("Ubicación", 670, doc.y);
    doc.moveDown(0.5);
    doc.font("Helvetica");

    registros.forEach(r => {
      const ingresoDate = r.ingreso ? new Date(r.ingreso) : null;
      const salidaDate = r.salida ? new Date(r.salida) : null;

      let tiempoTrabajado = "Pendiente";
      if (ingresoDate && salidaDate) {
        const diffMs = salidaDate - ingresoDate;
        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
        tiempoTrabajado = `${horas}h ${minutos}m ${segundos}s`;
      }

      // Normalizar IP (tomamos la primera si viene como lista)
      const ip = Array.isArray(r.ip) ? r.ip[0] : r.ip;

      // Ubicación
      const ubicacion = r.ubicacionIngreso
        ? `Lat: ${r.ubicacionIngreso.lat}, Lng: ${r.ubicacionIngreso.lng}`
        : "No disponible";

      // Escribir fila
      const y = doc.y;
      doc.text(r.dni, 30, y, { width: 70 });
      doc.text(r.nombre, 110, y, { width: 120 });
      doc.text(ingresoDate ? ingresoDate.toLocaleString("es-AR", opcionesHora) : "-", 240, y, { width: 100 });
      doc.text(salidaDate ? salidaDate.toLocaleString("es-AR", opcionesHora) : "-", 350, y, { width: 100 });
      doc.text(tiempoTrabajado, 460, y, { width: 70 });
      doc.text(ip || "-", 540, y, { width: 120 });
      doc.text(ubicacion, 670, y);

      doc.moveDown(0.5);
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { generarPDF };
