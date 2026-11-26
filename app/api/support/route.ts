import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipHits.set(ip, timestamps);
  return false;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHeaderBreaks(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Demasiadas solicitudes de soporte. Espera unos minutos." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const subject = stripHeaderBreaks(String(formData.get("subject") ?? "")).slice(0, 160);
    const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
    const patientEmail = stripHeaderBreaks(String(formData.get("email") ?? "")).slice(0, 180);
    const patientName = stripHeaderBreaks(String(formData.get("name") ?? "")).slice(0, 120);

    if (!subject || !message || !patientEmail) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios." }, { status: 400 });
    }
    if (!EMAIL_RE.test(patientEmail)) {
      return NextResponse.json({ success: false, error: "Correo electrónico inválido." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Falta RESEND_API_KEY en las variables de entorno.");
      return NextResponse.json({ success: false, error: "Error de configuración del servidor." }, { status: 500 });
    }

    const safeName = escapeHtml(patientName || "No especificado");
    const safeEmail = escapeHtml(patientEmail);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: "QuHealthy Soporte <onboarding@quhealthy.org>",
      to: ["support@quhealthy.org", "founders@quhealthy.org"],
      replyTo: patientEmail,
      subject: `[Soporte Dashboard] ${subject} - ${patientName || "Usuario"}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #000;">Nuevo ticket de soporte</h2>
          <p>Has recibido una nueva solicitud de soporte desde el dashboard de paciente de <strong>QuHealthy</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Paciente:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <p><strong>Asunto:</strong> ${safeSubject}</p>
          <br/>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: monospace;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json(
        { success: false, error: "Hubo un error al intentar enviar tu solicitud. Por favor intenta más tarde." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error crítico al enviar el ticket de soporte:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
