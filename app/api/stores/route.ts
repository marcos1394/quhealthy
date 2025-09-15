import { NextResponse } from 'next/server';

// Esta función se ejecuta en el servidor de Vercel
export async function GET() {
  try {
    console.log("🔹 [Route Handler] Petición recibida en /api/stores. Llamando al backend de Render...");
    
    // Obtenemos la URL del backend desde una variable de entorno
    // Nota: Ya no es necesario que sea NEXT_PUBLIC_
    const apiUrl = `${process.env.API_URL}/api/marketplace/stores`;

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 } // Mantenemos la misma estrategia de caché
    });

    if (!res.ok) {
      // Si el backend de Render falla, capturamos el error
      const errorText = await res.text();
      console.error(`❌ [Route Handler] Error del backend de Render: ${res.status} - ${errorText}`);
      throw new Error(`Error del backend: ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ [Route Handler] Datos recibidos de Render. Enviando al cliente...`);
    
    // Devolvemos los datos al componente que los pidió
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ [Route Handler] Error crítico al contactar el backend:", error);
    // Devolvemos una respuesta de error estandarizada
    return NextResponse.json(
      { message: "No se pudieron obtener las tiendas." },
      { status: 500 }
    );
  }
}