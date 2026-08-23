import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientClinicalBudgetDTO } from "@/types/clinical-budget";

interface BudgetPdfOptions {
  accentColorHex?: string;
  clinicLogoUrl?: string;
  footerNote?: string;
}

export function formatDoctorDisplayName(rawName?: string): string {
  if (!rawName) return "Dr. Médico Especialista";
  let clean = rawName.trim();
  clean = clean.replace(/^(Dr\(a\)\.?|Dr\.|Dra\.|Doctora|Doctor)\s+/i, "").trim();
  return `Dr. ${clean}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace(/^#/, "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:image/")) return url;
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
  } catch {
    return null;
  }
}

export async function generateClinicalBudgetPdf(
  budget: PatientClinicalBudgetDTO,
  options?: BudgetPdfOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  const accentColor: [number, number, number] = options?.accentColorHex
    ? hexToRgb(options.accentColorHex)
    : [5, 150, 105]; // Emerald 600 default

  const darkText: [number, number, number] = [17, 24, 39]; // Gray 900
  const mutedText: [number, number, number] = [107, 114, 128]; // Gray 500
  const lightBg: [number, number, number] = [249, 250, 251]; // Gray 50
  const borderGray: [number, number, number] = [229, 231, 235]; // Gray 200

  // ── 1. BARRA SUPERIOR DECORATIVA DE COLOR DE ACENTO ──────────────────────────
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, pageWidth, 4, "F");

  // ── 2. MEMBRETE OFICIAL DEL MÉDICO / CLÍNICA ────────────────────────────────
  const doctorName = formatDoctorDisplayName(budget.doctorName);
  const logoSource = budget.doctorLogoUrl || options?.clinicLogoUrl;
  let logoBase64: string | null = null;
  if (logoSource) {
    logoBase64 = await loadImageAsBase64(logoSource);
  }

  // Folio y Vigencia en cuadro a la derecha
  const boxWidth = 55;
  const boxHeight = 22;
  const boxX = pageWidth - margin - boxWidth;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("FOLIO OFICIAL", boxX + boxWidth - 4, currentY + 5.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(budget.folio || "PR-2026", boxX + boxWidth - 4, currentY + 11.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text(`Emisión: ${new Date(budget.createdAt).toLocaleDateString("es-MX")}`, boxX + boxWidth - 4, currentY + 16.5, { align: "right" });
  doc.text(`Vigencia: ${budget.validUntil}`, boxX + boxWidth - 4, currentY + 20, { align: "right" });

  let textStartX = margin;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margin, currentY + 1, 16, 16);
      textStartX = margin + 19;
    } catch {
      // Ignorar error de decodificación si no es imagen válida
    }
  }

  // Título / Tipo de Documento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("COTIZACIÓN CLÍNICA & QUIRÚRGICA OFICIAL", textStartX, currentY + 4);

  // Nombre del Doctor / Institución
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(doctorName, textStartX, currentY + 10);

  // Especialidad y Cédula Profesional SEP
  let subInfoY = currentY + 14.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);

  if (budget.doctorLicense || budget.doctorSpecialty) {
    const specText = budget.doctorSpecialty ? `${budget.doctorSpecialty}` : "Especialista";
    const licenseText = budget.doctorLicense ? ` | Cédula Profesional SEP: ${budget.doctorLicense}` : "";
    doc.text(`${specText}${licenseText}`, textStartX, subInfoY);
    subInfoY += 4;
  }

  // Teléfono, Correo y Dirección del Consultorio
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  const contactParts: string[] = [];
  if (budget.doctorAddress) contactParts.push(`Dir: ${budget.doctorAddress}`);
  if (budget.doctorPhone) contactParts.push(`Tel: ${budget.doctorPhone}`);
  if (budget.doctorEmail) contactParts.push(`Email: ${budget.doctorEmail}`);
  if (contactParts.length > 0) {
    const splitContacts = doc.splitTextToSize(contactParts.join("  •  "), boxX - textStartX - 3);
    doc.text(splitContacts, textStartX, subInfoY);
    subInfoY += splitContacts.length * 3.5;
  }

  currentY = Math.max(subInfoY + 4, currentY + boxHeight + 4);

  // Línea divisoria
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // ── 3. DATOS DEL PACIENTE & DIAGNÓSTICO CIE-10 ──────────────────────────────
  const patientCardHeight = 20;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, patientCardHeight, 2, 2, "FD");

  // Columna 1: Paciente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("PACIENTE", margin + 4, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(budget.patientName || "Paciente", margin + 4, currentY + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  const pContact = [budget.patientPhone, budget.patientEmail].filter(Boolean).join(" • ");
  doc.text(pContact || "Sin datos adicionales", margin + 4, currentY + 15.5);

  // Columna 2: Procedimiento
  const col2X = margin + (pageWidth - margin * 2) * 0.42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("PROCEDIMIENTO / CIRUGÍA", col2X, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  const splitProc = doc.splitTextToSize(budget.procedureName || "Consulta / Intervención", 55);
  doc.text(splitProc, col2X, currentY + 10);

  // Columna 3: Diagnóstico CIE-10
  const col3X = margin + (pageWidth - margin * 2) * 0.72;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("DIAGNÓSTICO CIE-10", col3X, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  const splitCie = doc.splitTextToSize(budget.diagnosisCie10 || "No especificado", 45);
  doc.text(splitCie, col3X, currentY + 10);

  currentY += patientCardHeight + 6;

  // ── 4. TABLA DE CONCEPTOS & HONORARIOS ──────────────────────────────────────
  const tableData = (budget.items || []).map((it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.unitPrice) || 0;
    const sub = qty * price;
    return [
      it.description || "Concepto",
      (it.itemType || "GENERAL").replace(/_/g, " "),
      qty.toString(),
      `$${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      `$${sub.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Concepto", "Tipo de Partida", "Cant.", "P. Unitario (MXN)", "Subtotal (MXN)"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: lightBg,
      textColor: [55, 65, 81],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkText,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 38, fontSize: 7, textColor: mutedText },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    styles: {
      lineColor: borderGray,
      lineWidth: 0.2,
      cellPadding: 2.5,
    },
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ── 5. INDICACIONES CLÍNICAS & RESUMEN FINANCIERO ──────────────────────────
  const summaryBoxWidth = 72;
  const summaryBoxHeight = 32;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;

  // Indicaciones Clínicas a la izquierda
  const notesWidth = summaryBoxX - margin - 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("INDICACIONES CLÍNICAS & PREPARACIÓN PREVIA", margin, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  const notesText = budget.clinicalNotes || "No se especificaron indicaciones previas adicionales.";
  const splitNotes = doc.splitTextToSize(notesText, notesWidth);
  doc.text(splitNotes, margin, currentY + 9);

  // Cuadro de Resumen Financiero a la derecha
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, summaryBoxHeight, 2, 2, "FD");

  let sumY = currentY + 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("Subtotal Bruto:", summaryBoxX + 4, sumY);
  doc.text(`$${Number(budget.subtotalAmount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumY, { align: "right" });

  if (Number(budget.discountAmount || 0) > 0) {
    sumY += 4.5;
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("Descuento:", summaryBoxX + 4, sumY);
    doc.text(`-$${Number(budget.discountAmount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, sumY, { align: "right" });
  }

  sumY += 4.5;
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("IVA (Art. 15 Fracc. XIV LIVA):", summaryBoxX + 4, sumY);
  doc.text("EXENTO (0%)", summaryBoxX + summaryBoxWidth - 4, sumY, { align: "right" });

  sumY += 3;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(summaryBoxX + 4, sumY, summaryBoxX + summaryBoxWidth - 4, sumY);

  sumY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text("TOTAL A PAGAR:", summaryBoxX + 4, sumY);

  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`$${Number(budget.totalAmount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`, summaryBoxX + summaryBoxWidth - 4, sumY, { align: "right" });

  currentY = Math.max(currentY + summaryBoxHeight + 8, currentY + splitNotes.length * 4 + 14);

  // ── 6. NOTA AL PIE PERSONALIZADA (SI EXISTE) ──────────────────────────────
  if (options?.footerNote) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(options.footerNote, pageWidth / 2, currentY, { align: "center" });
    currentY += 6;
  }

  // ── 7. SECCIÓN DE FIRMA DIGITAL & ACEPTACIÓN ────────────────────────────────
  const signBoxY = pageHeight - 34;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, signBoxY - 4, pageWidth - margin, signBoxY - 4);

  if (budget.patientSignatureUrl) {
    try {
      doc.addImage(budget.patientSignatureUrl, "PNG", pageWidth - margin - 50, signBoxY - 2, 45, 14);
    } catch {
      // Si la firma no es decodificable
    }
  }

  // Texto de firma
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text("Firma de Aceptación del Paciente", pageWidth - margin - 25, signBoxY + 16, { align: "center" });

  doc.text("Documento Clínico Cifrado QuHealthy Engine • Validez Legal NOM-004-SSA3-2012", margin, signBoxY + 16);

  // Descarga del PDF
  const filename = `Cotizacion_${budget.folio || "QuHealthy"}.pdf`;
  doc.save(filename);
}
