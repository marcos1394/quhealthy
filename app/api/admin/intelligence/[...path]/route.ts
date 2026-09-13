import { NextRequest, NextResponse } from 'next/server';

/**
 * 🛡️ INTEL-API-01: Adaptador BFF administrativo para la API privada de inteligencia corporativa.
 *
 * Características:
 * - Read-Only: Solo acepta peticiones GET (retorna 405 Method Not Allowed en cualquier intento de mutación).
 * - Feature Flag: Desactiva el piloto de inmediato sin afectar el portal existente si el flag está apagado.
 * - Anti-Spoofing & Gateway: Propaga las credenciales de sesión en servidor hacia analytics_service.
 */

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  // 1. Evaluación de Feature Flag
  const isFeatureEnabled =
    process.env.NEXT_PUBLIC_FEATURE_INTEL_PILOT === 'true' ||
    process.env.FEATURE_INTEL_PILOT === 'true';

  if (!isFeatureEnabled) {
    return NextResponse.json(
      {
        error: 'El piloto de inteligencia operativa está desactivado por Feature Flag.',
        flag: 'NEXT_PUBLIC_FEATURE_INTEL_PILOT',
        status: 'DISABLED',
      },
      {
        status: 503,
        headers: {
          'X-Feature-Disabled': 'INTEL_PILOT',
        },
      }
    );
  }

  const { path = [] } = await context.params;
  const subPath = path.join('/');

  const searchParams = request.nextUrl.search;
  const backendBaseUrl =
    process.env.ANALYTICS_SERVICE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.quhealthy.org';

  const targetUrl = `${backendBaseUrl}/api/v1/intelligence/${subPath}${searchParams}`;

  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const downstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await downstreamResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: downstreamResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'X-BFF-Proxy': 'OperatingIntelligenceBFF',
      },
    });
  } catch (error) {
    console.error('❌ Error en BFF Operating Intelligence:', error);
    return NextResponse.json(
      {
        error: 'Error de comunicación con el servicio de inteligencia operativa.',
        detail: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 502 }
    );
  }
}

// 🚫 Bloqueo estricto de cualquier método de escritura / mutación
export async function POST() {
  return NextResponse.json({ error: 'Operación no permitida. La API es de sólo lectura.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Operación no permitida. La API es de sólo lectura.' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Operación no permitida. La API es de sólo lectura.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Operación no permitida. La API es de sólo lectura.' }, { status: 405 });
}
