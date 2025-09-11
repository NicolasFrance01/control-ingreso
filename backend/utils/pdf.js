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

    const opcionesHora = { timeZone: "America/Argentina/Buenos_Aires", hour12: false };

    registros.forEach(r => {
      const ingresoDate = r.ingreso ? new Date(r.ingreso) : null;
      const salidaDate = r.salida ? new Date(r.salida) : null;

      // Calcular horas trabajadas
      let tiempoTrabajado = "Pendiente";
      if (ingresoDate && salidaDate) {
        const diffMs = salidaDate - ingresoDate;
        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
        tiempoTrabajado = `${horas}h ${minutos}m ${segundos}s`;
      }

      doc.moveDown();
      doc.text(`DNI: ${r.dni} | Nombre: ${r.nombre}`);
      doc.text(`Ingreso: ${ingresoDate ? ingresoDate.toLocaleString("es-AR", opcionesHora) : "No registrado"}`);
      doc.text(`Salida: ${salidaDate ? salidaDate.toLocaleString("es-AR", opcionesHora) : "Pendiente"}`);
      doc.text(`Horas trabajadas: ${tiempoTrabajado}`);
      doc.text(`IP: ${r.ip}`);
      doc.text(`Ubicación de ingreso: ${r.ubicacionIngreso ? `Lat: ${r.ubicacionIngreso.lat}, Lng: ${r.ubicacionIngreso.lng}` : "No disponible"}`);

      // Enlace a Maps si tiene ubicación
      if (r.ubicacionIngreso && r.ubicacionIngreso.lat && r.ubicacionIngreso.lng) {
        const urlMaps = `https://www.google.com/maps?q=${r.ubicacionIngreso.lat},${r.ubicacionIngreso.lng}`;
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
