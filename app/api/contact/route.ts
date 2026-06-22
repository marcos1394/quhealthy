import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const topic = formData.get("topic") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios." });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Falta RESEND_API_KEY en las variables de entorno.");
      return NextResponse.json({ success: false, error: "Error de configuración del servidor." });
    }

    const resend = new Resend(apiKey);
    const companyText = company ? `<p><strong>Empresa:</strong> ${company}</p>` : "";

    const { error } = await resend.emails.send({
      from: "QuHealthy Contacto <onboarding@quhealthy.org>", 
      to: ["founders@quhealthy.org"],
      replyTo: email,
      subject: `Nuevo mensaje de Contacto: ${topic} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2b6cb0;">Nuevo mensaje de contacto</h2>
          <p>Has recibido un nuevo mensaje desde el formulario de contacto de <strong>QuHealthy.org</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Nombre:</strong> ${name}</p>
          ${companyText}
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Tema:</strong> ${topic}</p>
          <br/>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json({ success: false, error: "Hubo un error al intentar enviar tu mensaje con Resend." });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error crítico al enviar el correo:", error);
    return NextResponse.json({ success: false, error: "Hubo un error al intentar enviar tu mensaje. Intenta de nuevo más tarde." });
  }
}
