const CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const GOOGLE_STS_URL = 'https://sts.googleapis.com/v1/token';
const PROVIDER_RESOURCE_PATTERN =
  /^projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/;

export type CloudRunIdentityConfig = {
  providerResource: string;
  serviceAccountEmail: string;
  targetAudience: string;
};

export function getCloudRunIdentityConfig(
  environment: NodeJS.ProcessEnv = process.env
): CloudRunIdentityConfig {
  const providerResource = environment.GCP_WORKLOAD_IDENTITY_PROVIDER?.trim();
  const serviceAccountEmail = environment.GCP_SERVICE_ACCOUNT_EMAIL?.trim();
  const targetAudience = environment.ANALYTICS_SERVICE_AUDIENCE?.trim();

  if (!providerResource || !PROVIDER_RESOURCE_PATTERN.test(providerResource)) {
    throw new Error('La identidad federada de Google Cloud no está configurada.');
  }

  if (
    !serviceAccountEmail ||
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/.test(
      serviceAccountEmail
    )
  ) {
    throw new Error('La cuenta invocadora de Google Cloud no está configurada.');
  }

  if (!targetAudience) {
    throw new Error('La audiencia de Cloud Run no está configurada.');
  }

  const audienceUrl = new URL(targetAudience);
  if (
    audienceUrl.protocol !== 'https:' ||
    audienceUrl.username ||
    audienceUrl.password ||
    audienceUrl.search ||
    audienceUrl.hash ||
    audienceUrl.pathname !== '/'
  ) {
    throw new Error('La audiencia de Cloud Run no es válida.');
  }

  return {
    providerResource,
    serviceAccountEmail,
    targetAudience: audienceUrl.origin,
  };
}

/**
 * Obtiene un ID token de corta duración para Cloud Run mediante Vercel OIDC y
 * Workload Identity Federation. No usa ni acepta llaves JSON persistentes.
 */
export async function getCloudRunIdToken(
  config: CloudRunIdentityConfig = getCloudRunIdentityConfig()
): Promise<string> {
  // Las dependencias sólo se cargan después de que la petición superó los
  // guardas síncronos del BFF (flag, ruta, configuración y JWT de usuario).
  const [{ getVercelOidcToken }, { ExternalAccountClient, Impersonated }] =
    await Promise.all([import('@vercel/oidc'), import('google-auth-library')]);

  const providerAudience = `//iam.googleapis.com/${config.providerResource}`;
  const vercelAudience = `https://iam.googleapis.com/${config.providerResource}`;
  const sourceClient = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: providerAudience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: GOOGLE_STS_URL,
    subject_token_supplier: {
      getSubjectToken: () => getVercelOidcToken({ audience: vercelAudience }),
    },
  });

  if (!sourceClient) {
    throw new Error('No fue posible inicializar la identidad federada.');
  }

  sourceClient.scopes = [CLOUD_PLATFORM_SCOPE];

  const identityClient = new Impersonated({
    sourceClient,
    targetPrincipal: config.serviceAccountEmail,
    targetScopes: [CLOUD_PLATFORM_SCOPE],
    lifetime: 600,
  });

  return identityClient.fetchIdToken(config.targetAudience, {
    includeEmail: true,
  });
}
