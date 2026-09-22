import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/server/cloud-run-identity', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('@/lib/server/cloud-run-identity')
  >();

  return {
    ...original,
    getCloudRunIdToken: vi.fn(),
  };
});

import {
  getCloudRunIdentityConfig,
  getCloudRunIdToken,
} from '@/lib/server/cloud-run-identity';
import {
  DELETE,
  GET,
  PATCH,
  POST,
  PUT,
} from '@/app/api/admin/intelligence/[...path]/route';

const analyticsOrigin = 'https://analytics-service-example.us-central1.run.app';
const providerResource =
  'projects/123456789/locations/global/workloadIdentityPools/vercel-preview/providers/vercel';

function createRequest(authorization?: string) {
  const headers = new Headers();
  if (authorization) headers.set('authorization', authorization);

  return new NextRequest(
    'https://preview.quhealthy.test/api/admin/intelligence/kpi-definitions?period=week',
    { headers }
  );
}

describe('STAGE-VERCEL-BFF-01: identidad separada para Cloud Run privado', () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FEATURE_INTEL_PILOT = 'true';
    process.env.ANALYTICS_SERVICE_URL = analyticsOrigin;
    process.env.ANALYTICS_SERVICE_AUDIENCE = analyticsOrigin;
    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER = providerResource;
    process.env.GCP_SERVICE_ACCOUNT_EMAIL =
      'vercel-preview-invoker@quhealthy-staging.iam.gserviceaccount.com';
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
    vi.restoreAllMocks();
  });

  it('conserva el JWT de usuario y usa una identidad distinta para Cloud Run', async () => {
    vi.mocked(getCloudRunIdToken).mockResolvedValue('google-id-token');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'available' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(createRequest('Bearer user-session-jwt'), {
      params: Promise.resolve({ path: ['kpi-definitions'] }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      `${analyticsOrigin}/api/v1/intelligence/kpi-definitions?period=week`
    );
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer user-session-jwt',
      'X-Serverless-Authorization': 'Bearer google-id-token',
    });
    expect(JSON.stringify(await response.json())).not.toContain('google-id-token');
  });

  it('rechaza la petición sin JWT antes de solicitar identidad de infraestructura', async () => {
    const response = await GET(createRequest(), {
      params: Promise.resolve({ path: ['kpi-definitions'] }),
    });

    expect(response.status).toBe(401);
    expect(getCloudRunIdToken).not.toHaveBeenCalled();
  });

  it('falla cerrado cuando URL y audiencia de Cloud Run no coinciden', async () => {
    process.env.ANALYTICS_SERVICE_AUDIENCE =
      'https://otro-servicio.us-central1.run.app';

    const response = await GET(createRequest('Bearer user-session-jwt'), {
      params: Promise.resolve({ path: ['source-health'] }),
    });

    expect(response.status).toBe(503);
    expect(getCloudRunIdToken).not.toHaveBeenCalled();
  });

  it('valida la configuración federada sin aceptar endpoints o identidades arbitrarias', () => {
    expect(getCloudRunIdentityConfig()).toEqual({
      providerResource,
      serviceAccountEmail:
        'vercel-preview-invoker@quhealthy-staging.iam.gserviceaccount.com',
      targetAudience: analyticsOrigin,
    });

    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER = 'https://attacker.example/provider';
    expect(() => getCloudRunIdentityConfig()).toThrow(
      'La identidad federada de Google Cloud no está configurada.'
    );
  });

  it.each([POST, PUT, PATCH, DELETE])(
    'mantiene bloqueados todos los métodos de escritura',
    async (handler) => {
      const response = await handler();
      expect(response.status).toBe(405);
      expect(response.headers.get('allow')).toBe('GET');
    }
  );
});
