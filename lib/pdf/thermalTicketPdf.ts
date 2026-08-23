// lib/pdf/thermalTicketPdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PosReceipt } from "@/types/pos";

/**
 * Función auxiliar para convertir una imagen a Base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("No se pudo cargar la imagen para el ticket térmico:", e);
    return null;
  }
}

/**
 * Genera el QR como Data URL usando canvas en memoria
 */
async function generateQrDataUrl(text: string): Promise<string | null> {
  try {
    // Generar un QR usando una API pública rápida o canvas
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
    return await loadImageAsBase64(qrApiUrl);
  } catch (e) {
    console.warn("No se pudo generar el QR del ticket:", e);
    return null;
  }
}

/**
 * Genera y descarga o imprime un Ticket Térmico en formato 80mm
 */
export async function generateThermalTicketPdf(
  receipt: PosReceipt,
  options?: {
    clinicName?: string;
    doctorName?: string;
    doctorLicense?: string;
    doctorSpecialty?: string;
    doctorAddress?: string;
    doctorPhone?: string;
    logoUrl?: string;
    autoPrint?: boolean;
  }
): Promise<jsPDF> {
  // Ancho estándar de rollo térmico: 80 mm (aprox 226 pt)
  const ticketWidth = 80;
  // Alto dinámico estimado según el número de partidas
  const itemCount = receipt.items?.length || 1;
  const paymentCount = receipt.payments?.length || 1;
  const estimatedHeight = Math.max(200, 140 + itemCount * 10 + paymentCount * 8);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [ticketWidth, estimatedHeight],
  });

  const centerX = ticketWidth / 2;
  let currentY = 8;

  // ── 1. LOGO DEL CONSULTORIO (Opcional) ─────────────────────────────────
  const logoUrl = options?.logoUrl || receipt.doctorLogoUrl;
  if (logoUrl) {
    const logoBase64 = await loadImageAsBase64(logoUrl);
    if (logoBase64) {
      try {
        const logoSize = 14;
        doc.addImage(
          logoBase64,
          "JPEG",
          centerX - logoSize / 2,
          currentY,
          logoSize,
          logoSize
        );
        currentY += logoSize + 4;
      } catch (e) {
        console.warn("Error al renderizar logo en ticket:", e);
      }
    }
  }

  // ── 2. ENCABEZADO DEL CONSULTORIO / MÉDICO ─────────────────────────────
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);

  const emitterName =
    options?.doctorName ||
    receipt.doctorName ||
    options?.clinicName ||
    "CONSULTORIO MÉDICO QUHEALTHY";
  doc.text(emitterName.toUpperCase(), centerX, currentY, { align: "center" });
  currentY += 4.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);

  const license = options?.doctorLicense || receipt.doctorLicense;
  if (license) {
    doc.text(`CÉDULA PROF. SEP: ${license}`, centerX, currentY, {
      align: "center",
    });
    currentY += 3.5;
  }

  const specialty = options?.doctorSpecialty || receipt.doctorSpecialty;
  if (specialty) {
    doc.text(specialty.toUpperCase(), centerX, currentY, { align: "center" });
    currentY += 3.5;
  }

  const address = options?.doctorAddress || receipt.doctorAddress;
  if (address) {
    const splitAddress = doc.splitTextToSize(address, 70);
    doc.text(splitAddress, centerX, currentY, { align: "center" });
    currentY += splitAddress.length * 3;
  }

  const phone = options?.doctorPhone || receipt.doctorPhone;
  if (phone) {
    doc.text(`TEL: ${phone}`, centerX, currentY, { align: "center" });
    currentY += 3.5;
  }

  // Línea punteada de separación
  doc.text("------------------------------------------------", centerX, currentY, {
    align: "center",
  });
  currentY += 4;

  // ── 3. METADATOS DEL TICKET ───────────────────────────────────────────
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  doc.text(`TICKET DE PAGO: ${receipt.folio}`, centerX, currentY, {
    align: "center",
  });
  currentY += 4;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  const formattedDate = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : new Date().toLocaleString("es-MX");

  doc.text(`FECHA: ${formattedDate}`, 5, currentY);
  currentY += 3.5;

  if (receipt.staffName) {
    doc.text(`ATENDIÓ: ${receipt.staffName}`, 5, currentY);
    currentY += 3.5;
  }

  doc.text(`PACIENTE: ${receipt.patientName.toUpperCase()}`, 5, currentY);
  currentY += 3.5;

  if (receipt.patientRfc) {
    doc.text(`RFC: ${receipt.patientRfc}`, 5, currentY);
    currentY += 3.5;
  }

  doc.text("------------------------------------------------", centerX, currentY, {
    align: "center",
  });
  currentY += 3;

  // ── 4. TABLA DE CONCEPTOS ─────────────────────────────────────────────
  const tableData = receipt.items.map((it) => [
    `${it.quantity}x`,
    it.description,
    `$${(it.quantity * it.unitPrice).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["CANT", "DESCRIPCIÓN", "IMPORTE"]],
    body: tableData,
    theme: "plain",
    styles: {
      font: "courier",
      fontSize: 7,
      cellPadding: 1,
      overflow: "linebreak",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 46, halign: "left" },
      2: { cellWidth: 16, halign: "right" },
    },
    margin: { left: 5, right: 5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 3;

  // ── 5. TOTALES Y FORMAS DE PAGO ───────────────────────────────────────
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);

  doc.text("SUBTOTAL:", 42, currentY, { align: "right" });
  doc.text(`$${receipt.subtotalAmount.toFixed(2)}`, 75, currentY, {
    align: "right",
  });
  currentY += 3.5;

  if (receipt.discountAmount && receipt.discountAmount > 0) {
    doc.text("DESCUENTO:", 42, currentY, { align: "right" });
    doc.text(`-$${receipt.discountAmount.toFixed(2)}`, 75, currentY, {
      align: "right",
    });
    currentY += 3.5;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL:", 42, currentY, { align: "right" });
  doc.text(`$${receipt.totalAmount.toFixed(2)} MXN`, 75, currentY, {
    align: "right",
  });
  currentY += 4;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Exento de IVA Art. 15 Fracc. XIV LIVA (Servicios Médicos)", centerX, currentY, {
    align: "center",
  });
  currentY += 3.5;

  doc.text("------------------------------------------------", centerX, currentY, {
    align: "center",
  });
  currentY += 3.5;

  // Desglose de Pagos Mixtos
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.text("FORMAS DE PAGO:", 5, currentY);
  currentY += 3.5;

  doc.setFont("courier", "normal");
  receipt.payments.forEach((p) => {
    const methodLabel =
      p.method === "CASH"
        ? "EFECTIVO"
        : p.method === "CARD_TERMINAL"
        ? "TARJETA TERMINAL"
        : p.method === "SPEI_TRANSFER"
        ? "TRANSF. SPEI"
        : p.method === "STRIPE"
        ? "TARJETA ONLINE"
        : p.method;

    const ref = p.reference ? ` (${p.reference})` : "";
    doc.text(`• ${methodLabel}${ref}:`, 8, currentY);
    doc.text(`$${p.amount.toFixed(2)}`, 75, currentY, { align: "right" });
    currentY += 3;
  });

  if (receipt.changeAmount && receipt.changeAmount > 0) {
    doc.text("• CAMBIO DEVUELTO:", 8, currentY);
    doc.text(`$${receipt.changeAmount.toFixed(2)}`, 75, currentY, {
      align: "right",
    });
    currentY += 3.5;
  }

  // ── 6. CÓDIGO QR DE AUTOFACTURACIÓN SAT ────────────────────────────────
  currentY += 2;
  doc.text("------------------------------------------------", centerX, currentY, {
    align: "center",
  });
  currentY += 3.5;

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text("AUTOFACTURACIÓN SAT CFDI 4.0", centerX, currentY, {
    align: "center",
  });
  currentY += 3.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.text(
    "Escanea este código con tu celular para generar tu factura fiscal:",
    centerX,
    currentY,
    { align: "center" }
  );
  currentY += 3;

  const qrUrl = receipt.invoiceQrUrl || `https://www.quhealthy.org/es/facturacion?ticket=${receipt.folio}&token=${receipt.invoiceToken}`;
  const qrBase64 = await generateQrDataUrl(qrUrl);
  if (qrBase64) {
    const qrSize = 22;
    doc.addImage(
      qrBase64,
      "PNG",
      centerX - qrSize / 2,
      currentY,
      qrSize,
      qrSize
    );
    currentY += qrSize + 3;
  }

  doc.setFont("courier", "normal");
  doc.setFontSize(6);
  doc.text("quhealthy.org/es/facturacion", centerX, currentY, {
    align: "center",
  });
  currentY += 2.5;
  doc.text(`Token: ${receipt.invoiceToken.substring(0, 16)}...`, centerX, currentY, {
    align: "center",
  });
  currentY += 4;

  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.text("¡GRACIAS POR SU PREFERENCIA!", centerX, currentY, {
    align: "center",
  });

  if (options?.autoPrint) {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`Ticket-${receipt.folio}.pdf`);
  }

  return doc;
}
