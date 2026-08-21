import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ConsumerProfile } from "@/types/consumerProfile";

export async function generatePatientProfilePdf(
  profile: ConsumerProfile,
  userEmail?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const emeraldColor: [number, number, number] = [5, 150, 105]; // Emerald 600
  const textDark: [number, number, number] = [30, 41, 59]; // Slate 800
  const textMuted: [number, number, number] = [100, 116, 139]; // Slate 500
  const bgLight: [number, number, number] = [248, 250, 252]; // Slate 50
  const redAlert: [number, number, number] = [185, 28, 28]; // Red 700
  const whiteText: [number, number, number] = [255, 255, 255];

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 14;

  // ── 1. ENCABEZADO INSTITUCIONAL / BANNER SUPERIOR ──────────────────────
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 3, 3, "F");

  // Barra de acento verde esmeralda
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.rect(margin, currentY + 24, pageWidth - margin * 2, 2, "F");

  // Logo y Nombre del Sistema
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("QuHealthy", margin + 6, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("EXPEDIENTE CLÍNICO DIGITAL Y RESUMEN MÉDICO", margin + 6, currentY + 18);

  // Badge Normativa NOM-004
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text("NOM-004-SSA3-2012 / NOM-024", pageWidth - margin - 6, currentY + 11, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Emisión: ${dateStr}`, pageWidth - margin - 6, currentY + 18, {
    align: "right",
  });

  currentY += 32;

  // ── 2. DATOS DEL PACIENTE E IDENTIFICACIÓN ─────────────────────────────
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.birthDate);
  const fullName = profile.fullName || "Paciente Sin Nombre";
  const curp = profile.curp || (profile.personalBackground?.curp as string) || "No registrada";
  const rfc = profile.rfc || (profile.personalBackground?.rfc as string) || "No registrado";
  const bloodType = profile.bloodType || "No especificado";
  const nationality = profile.nationality || (profile.personalBackground?.nationality as string) || "Mexicana";
  const maritalStatus = profile.maritalStatus || (profile.personalBackground?.maritalStatus as string) || "No especificado";
  const occupation = profile.occupation || (profile.personalBackground?.occupation as string) || "No especificada";
  const phone = profile.phoneNumber || "No registrado";
  const email = userEmail || "No registrado";

  const organDonorMap: Record<string, string> = {
    YES: "Sí, Donador Expreso",
    NO: "No Donador",
    FAMILY_DECIDES: "Decisión Familiar",
  };
  const organDonor = organDonorMap[profile.organDonor || ""] || "Decisión Familiar";

  // Tarjeta de Identidad Principal
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "1. IDENTIFICACIÓN Y DATOS PERSONALES DEL PACIENTE",
          colSpan: 4,
          styles: {
            fillColor: primaryColor,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Nombre Completo:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: fullName, styles: { fontStyle: "bold", textColor: textDark } },
        { content: "Grupo Sanguíneo:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: bloodType, styles: { fontStyle: "bold", textColor: redAlert } },
      ],
      [
        { content: "CURP:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: curp, styles: { fontStyle: "bold", textColor: textDark } },
        { content: "RFC:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: rfc, styles: { textColor: textDark } },
      ],
      [
        { content: "Fecha de Nacimiento:", styles: { fontStyle: "bold", textColor: textMuted } },
        {
          content: profile.birthDate ? `${profile.birthDate} ${age !== null ? `(${age} años)` : ""}` : "No especificada",
          styles: { textColor: textDark },
        },
        { content: "Sexo Biológico / Género:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: `${profile.biologicalSex || "No especificado"} / ${profile.gender || "No especificado"}`, styles: { textColor: textDark } },
      ],
      [
        { content: "Nacionalidad:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: nationality, styles: { textColor: textDark } },
        { content: "Estado Civil:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: maritalStatus, styles: { textColor: textDark } },
      ],
      [
        { content: "Ocupación:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: occupation, styles: { textColor: textDark } },
        { content: "Donador de Órganos:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: organDonor, styles: { fontStyle: "bold", textColor: emeraldColor } },
      ],
      [
        { content: "Teléfono Móvil:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: phone, styles: { textColor: textDark } },
        { content: "Correo Electrónico:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: email, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 53 },
      2: { cellWidth: 42 },
      3: { cellWidth: 49 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // ── 3. DOMICILIO Y SEGURO MÉDICO ───────────────────────────────────────
  const address = [
    profile.addressStreet || (profile.personalBackground?.addressStreet as string),
    profile.addressCity || profile.location || (profile.personalBackground?.addressCity as string),
    profile.addressState || (profile.personalBackground?.addressState as string),
    profile.addressPostalCode ? `C.P. ${profile.addressPostalCode}` : "",
  ]
    .filter(Boolean)
    .join(", ") || "No registrado";

  const insuranceProvider =
    profile.insuranceProvider ||
    (profile.personalBackground?.insuranceProvider as string) ||
    profile.healthInsurance ||
    "Particular / Sin Seguro";

  const insurancePolicy =
    profile.insurancePolicyNumber ||
    (profile.personalBackground?.insurancePolicyNumber as string) ||
    "N/A";

  const insurancePlan =
    profile.insurancePlanName ||
    (profile.personalBackground?.insurancePlanName as string) ||
    "Estándar";

  const insuranceTypeMap: Record<string, string> = {
    PUBLIC: "Público (IMSS / ISSSTE / Bienestar)",
    PRIVATE: "Seguro de Gastos Médicos Mayores (Privado)",
    NONE: "Particular / Sin Seguro",
  };
  const insuranceTypeStr =
    insuranceTypeMap[profile.insuranceType || ""] ||
    insuranceTypeMap[(profile.personalBackground?.insuranceType as string) || ""] ||
    "Particular / Sin Seguro";

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "2. DOMICILIO Y COBERTURA DE SALUD / SEGURO",
          colSpan: 4,
          styles: {
            fillColor: primaryColor,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Domicilio Completo:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: address, colSpan: 3, styles: { textColor: textDark } },
      ],
      [
        { content: "Tipo de Cobertura:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: insuranceTypeStr, styles: { textColor: textDark } },
        { content: "Aseguradora / Institución:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: insuranceProvider, styles: { fontStyle: "bold", textColor: textDark } },
      ],
      [
        { content: "Número de Póliza / Afiliación:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: insurancePolicy, styles: { fontStyle: "bold", textColor: textDark } },
        { content: "Plan / Cobertura:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: insurancePlan, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 53 },
      2: { cellWidth: 42 },
      3: { cellWidth: 49 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // ── 4. CONTACTO DE EMERGENCIA Y MÉDICO DE CABECERA ─────────────────────
  const emergencyName =
    profile.emergencyContactName ||
    (profile.personalBackground?.emergencyContactName as string) ||
    "No registrado";
  const emergencyRel =
    profile.emergencyContactRelationship ||
    (profile.personalBackground?.emergencyContactRelationship as string) ||
    "Familiar";
  const emergencyPhone =
    profile.emergencyContactPhone ||
    (profile.personalBackground?.emergencyContactPhone as string) ||
    "No registrado";
  const emergencyPhoneAlt =
    profile.emergencyContactPhoneAlt ||
    (profile.personalBackground?.emergencyContactPhoneAlt as string) ||
    "";
  const primaryPhysician =
    profile.primaryPhysician ||
    (profile.personalBackground?.primaryPhysician as string) ||
    "No especificado";

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "3. CONTACTO DE EMERGENCIA Y MÉDICO TRATANTE",
          colSpan: 4,
          styles: {
            fillColor: primaryColor,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Contacto de Emergencia:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: `${emergencyName} (${emergencyRel})`, styles: { fontStyle: "bold", textColor: textDark } },
        { content: "Teléfono(s) Emergencia:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: `${emergencyPhone}${emergencyPhoneAlt ? ` / Alt: ${emergencyPhoneAlt}` : ""}`, styles: { fontStyle: "bold", textColor: redAlert } },
      ],
      [
        { content: "Médico de Cabecera:", styles: { fontStyle: "bold", textColor: textMuted } },
        { content: primaryPhysician, colSpan: 3, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 53 },
      2: { cellWidth: 42 },
      3: { cellWidth: 49 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // ── 5. ALERGIAS Y MEDICAMENTOS ACTUALES (ALERTA CRÍTICA) ───────────────
  const allergiesList = (profile.allergies || [])
    .map((a: any) => (typeof a === "string" ? a : a?.name || ""))
    .filter(Boolean);
  const allergiesStr =
    allergiesList.length > 0
      ? allergiesList.join(", ")
      : "Sin alergias medicamentosas o alimentarias conocidas referidas (Negadas)";

  const medsList = profile.currentMedications || [];
  const medsStr =
    medsList.length > 0
      ? medsList.join(", ")
      : "Sin medicamentos de uso continuo activos referidos";

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "4. ALERTAS CRÍTICAS: ALERGIAS Y FARMACOTERAPIA ACTUAL",
          colSpan: 2,
          styles: {
            fillColor: redAlert,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Alergias Conocidas / Reacciones:", styles: { fontStyle: "bold", textColor: redAlert, cellWidth: 50 } },
        { content: allergiesStr, styles: { fontStyle: "bold", textColor: textDark } },
      ],
      [
        { content: "Medicamentos Actuales:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: medsStr, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // ── 6. ANTECEDENTES PATOLÓGICOS Y CLÍNICOS ESTRUCTURADOS ────────────────
  const chronicDiseases =
    profile.chronicDiseases ||
    (profile.personalBackground?.chronicDiseases as string) ||
    "Sin padecimientos crónicos referidos";
  const surgeries =
    profile.surgeries ||
    (profile.personalBackground?.surgeries as string) ||
    "Sin cirugías o procedimientos quirúrgicos previos referidos";
  const implants =
    profile.implantsDevices ||
    (profile.personalBackground?.implantsDevices as string) ||
    "Sin implantes, prótesis ni marcapasos";
  const vaccinations =
    profile.vaccinations ||
    (profile.personalBackground?.vaccinations as string) ||
    "Esquema de vacunación referido al corriente";

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "5. ANTECEDENTES PATOLÓGICOS, QUIRÚRGICOS Y DISPOSITIVOS",
          colSpan: 2,
          styles: {
            fillColor: primaryColor,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Padecimientos Crónicos:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: chronicDiseases, styles: { textColor: textDark } },
      ],
      [
        { content: "Cirugías Previas:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: surgeries, styles: { textColor: textDark } },
      ],
      [
        { content: "Implantes / Dispositivos:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: implants, styles: { textColor: textDark } },
      ],
      [
        { content: "Vacunación:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: vaccinations, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // ── 7. ANTECEDENTES HEREDOFAMILIARES Y ESTILO DE VIDA (NOM-004) ────────
  const formatBackgroundMap = (map?: Record<string, any> | null) => {
    if (!map) return "Sin antecedentes registrados";
    const entries = Object.entries(map).filter(
      ([k, v]) => v && typeof v === "string" && v.trim()
    );
    if (entries.length === 0) return "Sin antecedentes patológicos relevantes referidos";
    return entries.map(([k, v]) => `• ${k}: ${v}`).join("\n");
  };

  const familyBgStr = formatBackgroundMap(profile.familyBackground);
  const socialBgStr = formatBackgroundMap(profile.socialBackground);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        {
          content: "6. ANTECEDENTES HEREDOFAMILIARES Y ESTILO DE VIDA (NOM-004)",
          colSpan: 2,
          styles: {
            fillColor: primaryColor,
            textColor: whiteText,
            fontStyle: "bold",
            fontSize: 9,
          },
        },
      ],
    ],
    body: [
      [
        { content: "Heredofamiliares:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: familyBgStr, styles: { textColor: textDark } },
      ],
      [
        { content: "Estilo de Vida y Hábitos:", styles: { fontStyle: "bold", textColor: textMuted, cellWidth: 50 } },
        { content: socialBgStr, styles: { textColor: textDark } },
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
  });

  // ── 8. PIE DE PÁGINA Y AVISO LEGAL ─────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(margin, pageHeight - 18, pageWidth - margin * 2, 12, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Este documento es un resumen informativo del Expediente Clínico Personal generado a través del Sistema QuHealthy en apego a la NOM-004-SSA3-2012 y NOM-024-SSA3-2012.",
    margin + 3,
    pageHeight - 13
  );
  doc.text(
    "La información médica aquí contenida está protegida por secreto profesional y confidencialidad médica conforme a la legislación aplicable.",
    margin + 3,
    pageHeight - 9
  );

  // Nombre de archivo sanitizado
  const cleanName = (profile.fullName || "Paciente").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Expediente_Clinico_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`;

  // Descarga directa del archivo PDF
  doc.save(fileName);
}
