/**
 * QuHealthy Staging API Gateway
 * Cloudflare Worker for https://api-staging.quhealthy.org
 *
 * Routes incoming API requests to the corresponding GCP Cloud Run microservices
 * in the quhealthy-staging project, maintaining full parity with the production
 * GCP Cloud Load Balancer (url-map-quhealthy) while maintaining FinOps $0 cost in idle.
 */

const STAGING_UPSTREAMS = {
  auth: "https://auth-service-ayzpmwrdkq-uc.a.run.app",
  catalog: "https://catalog-service-ayzpmwrdkq-uc.a.run.app",
  onboarding: "https://onboarding-service-ayzpmwrdkq-uc.a.run.app",
  appointment: "https://appointment-service-ayzpmwrdkq-uc.a.run.app",
  analytics: "https://analytics-service-ayzpmwrdkq-uc.a.run.app",
};

const ALLOWED_ORIGINS = [
  "https://staging.quhealthy.org",
  "https://quhealthy.org",
  "http://localhost:3000",
];

function getCorsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : "https://staging.quhealthy.org";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Device-Id, X-Timezone, Cache-Control, Pragma",
    "Access-Control-Expose-Headers": "Set-Cookie, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function resolveUpstream(pathname) {
  if (pathname.startsWith("/api/auth")) {
    return STAGING_UPSTREAMS.auth;
  }
  if (pathname.startsWith("/api/catalog")) {
    return STAGING_UPSTREAMS.catalog;
  }
  if (pathname.startsWith("/api/onboarding")) {
    return STAGING_UPSTREAMS.onboarding;
  }
  if (pathname.startsWith("/api/appointments")) {
    return STAGING_UPSTREAMS.appointment;
  }
  if (
    pathname.startsWith("/api/intelligence") ||
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/admin/intelligence")
  ) {
    return STAGING_UPSTREAMS.analytics;
  }

  // Fallback to auth-service for general API or root
  return STAGING_UPSTREAMS.auth;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // 1. Gateway Health Check & Service Map
    if (url.pathname === "/healthz" || url.pathname === "/gateway-health") {
      return new Response(
        JSON.stringify(
          {
            status: "UP",
            environment: "staging",
            gateway: "api-staging.quhealthy.org",
            services: {
              auth: STAGING_UPSTREAMS.auth,
              catalog: STAGING_UPSTREAMS.catalog,
              onboarding: STAGING_UPSTREAMS.onboarding,
              appointment: STAGING_UPSTREAMS.appointment,
              analytics: STAGING_UPSTREAMS.analytics,
            },
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // 2. Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // 3. Resolve upstream Cloud Run microservice
    const upstreamBase = resolveUpstream(url.pathname);
    const targetUrl = new URL(url.pathname + url.search, upstreamBase);

    // 4. Clone and prepare headers
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("X-Forwarded-Host", url.host);
    forwardHeaders.set("X-Forwarded-Proto", "https");
    forwardHeaders.set(
      "X-Forwarded-For",
      request.headers.get("CF-Connecting-IP") || ""
    );

    // 5. Forward request to Cloud Run
    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      });

      // 6. Return response preserving all headers (including Set-Cookie)
      const responseHeaders = new Headers(response.headers);

      // Ensure CORS headers are present on all responses
      const cors = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(cors)) {
        if (!responseHeaders.has(key)) {
          responseHeaders.set(key, value);
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Gateway Upstream Error",
          message: err.message || "Failed to reach backend microservice",
          target: targetUrl.origin,
          path: url.pathname,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(origin),
          },
        }
      );
    }
  },
};
