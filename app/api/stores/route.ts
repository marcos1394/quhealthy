import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) { // Usamos el objeto request
  try {
    // --- INICIO DE LA CORRECCIÓN ---
    // Leemos los encabezados directamente del objeto 'request'
    const cookie = request.headers.get('cookie');
    // --- FIN DE LA CORRECCIÓN ---

    console.log("🔹 [Route Handler] Petición recibida.");
    console.log("🔹 [Route Handler] Cookies recibidas:", cookie || 'Ninguna');

    const apiUrl = `${process.env.API_URL}/api/marketplace/stores`;
    console.log(`🔹 [Route Handler] Llamando al backend de Render: ${apiUrl}`);

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }
    });
    
    console.log(`🔹 [Route Handler] Respuesta recibida de Render con estado: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [Route Handler] Error del backend de Render: ${res.status} - ${errorText}`);
      throw new Error(`Error del backend: ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ [Route Handler] Datos recibidos de Render.`);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ [Route Handler] Error crítico:", error);
    return NextResponse.json(
      { message: "No se pudieron obtener las tiendas." },
      { status: 500 }
    );
  }
}