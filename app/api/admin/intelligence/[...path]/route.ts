import { NextRequest, NextResponse } from 'next/server';
import {
  getCloudRunIdentityConfig,
  getCloudRunIdToken,
} from '@/lib/server/cloud-run-identity';

/**
 * 🛡️ INTEL-API-01: Adaptador BFF administrativo para la API privada de inteligencia corporativa.
 *
 * Características:
 * - Read-Only: Solo acepta peticiones GET (retorna 405 Method Not Allowed en cualquier intento de mutación).
 * - Feature Flag: Desactiva el piloto de inmediato sin afectar el portal existente si el flag está apagado.
 * - Gateway cerrado: valida la presencia del Bearer recibido, limita rutas y no propaga cookies.
 * - Doble identidad: conserva el JWT del usuario en Authorization y autentica
 *   la infraestructura ante Cloud Run con X-Serverless-Authorization.
 *
 * La identidad todavía se origina en el cliente porque el access token vive en memoria del navegador.
 * La migración a sesión BFF HttpOnly queda como brecha explícita; este adaptador no afirma derivarla.
 */

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  // 1. Evaluación de Feature Flag
  const isFeatureEnabled = process.env.FEATURE_INTEL_PILOT === 'true';

  if (!isFeatureEnabled) {
    return NextResponse.json(
      {
        error: 'El piloto de inteligencia operativa está desactivado por Feature Flag.',
        flag: 'FEATURE_INTEL_PILOT',
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
  const allowedPath = /^(kpi-definitions(?:\/[A-Za-z0-9._-]+)?|kpi-snapshots(?:\/latest)?|operational-events|source-health)$/;
  if (!allowedPath.test(subPath)) {
    return NextResponse.json({ error: 'Recurso de inteligencia no permitido.' }, { status: 404 });
  }

  const searchParams = request.nextUrl.search;
  const backendBaseUrl = process.env.ANALYTICS_SERVICE_URL;
  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: 'El adaptador de inteligencia no está configurado.' },
      { status: 503 }
    );
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Autenticación requerida.' }, { status: 401 });
    }

    const identityConfig = getCloudRunIdentityConfig();
    const backendUrl = new URL(backendBaseUrl);
    if (backendUrl.origin !== identityConfig.targetAudience) {
      return NextResponse.json(
        { error: 'La configuración del adaptador de inteligencia no es consistente.' },
        { status: 503 }
      );
    }

    const targetUrl = new URL(
      `/api/v1/intelligence/${subPath}${searchParams}`,
      backendUrl.origin
    ).toString();
    const cloudRunIdToken = await getCloudRunIdToken(identityConfig);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: authHeader,
      'X-Serverless-Authorization': `Bearer ${cloudRunIdToken}`,
    };

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
  } catch {
    console.error('Operating Intelligence BFF no pudo alcanzar el servicio configurado.');
    return NextResponse.json(
      {
        error: 'Error de comunicación con el servicio de inteligencia operativa.',
      },
      { status: 502 }
    );
  }
}

// 🚫 Bloqueo estricto de cualquier método de escritura / mutación
export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Operación no permitida. La API es de sólo lectura.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
