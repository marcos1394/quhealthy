import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const patientEmail = formData.get("email") as string;
    const patientName = formData.get("name") as string;

    if (!subject || !message || !patientEmail) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios." });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Falta RESEND_API_KEY en las variables de entorno.");
      return NextResponse.json({ success: false, error: "Error de configuración del servidor." });
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: "QuHealthy Soporte <onboarding@quhealthy.org>", 
      to: ["support@quhealthy.org", "founders@quhealthy.org"],
      replyTo: patientEmail,
      subject: `[Soporte Dashboard] ${subject} - ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #000;">Nuevo ticket de soporte</h2>
          <p>Has recibido una nueva solicitud de soporte desde el dashboard de paciente de <strong>QuHealthy</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Paciente:</strong> ${patientName || 'No especificado'}</p>
          <p><strong>Email:</strong> <a href="mailto:${patientEmail}">${patientEmail}</a></p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <br/>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: monospace;">
            ${message}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json({ success: false, error: "Hubo un error al intentar enviar tu solicitud. Por favor intenta más tarde." });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error crítico al enviar el ticket de soporte:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor. Intenta de nuevo más tarde." });
  }
}
