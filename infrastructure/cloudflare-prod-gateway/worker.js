/**
 * QuHealthy Production API Gateway
 * Cloudflare Worker for https://api.quhealthy.org
 *
 * Routes incoming API requests to the corresponding GCP Cloud Run microservices
 * in the quhealthy-backend project, providing high performance, global edge security,
 * DDoS mitigation, and SSL termination at zero idle infrastructure cost.
 *
 * Complete 12/12 Microservices Suite:
 * 1. auth-service
 * 2. catalog-service
 * 3. onboarding-service
 * 4. appointment-service
 * 5. analytics-service
 * 6. notification-service
 * 7. referral-service
 * 8. review-service
 * 9. payment-service
 * 10. social-service
 * 11. admin-service
 * 12. health-agent-service
 */

const PROD_UPSTREAMS = {
  auth: "https://auth-service-263kjqprkq-uc.a.run.app",
  catalog: "https://catalog-service-263kjqprkq-uc.a.run.app",
  onboarding: "https://onboarding-service-263kjqprkq-uc.a.run.app",
  appointment: "https://appointment-service-263kjqprkq-uc.a.run.app",
  analytics: "https://analytics-service-263kjqprkq-uc.a.run.app",
  notification: "https://notification-service-263kjqprkq-uc.a.run.app",
  referral: "https://referral-service-263kjqprkq-uc.a.run.app",
  review: "https://review-service-263kjqprkq-uc.a.run.app",
  payment: "https://payment-service-263kjqprkq-uc.a.run.app",
  social: "https://social-service-263kjqprkq-uc.a.run.app",
  admin: "https://admin-service-263kjqprkq-uc.a.run.app",
  healthAgent: "https://health-agent-service-263kjqprkq-uc.a.run.app",
};

function isOriginAllowed(requestOrigin) {
  if (!requestOrigin) return false;
  try {
    const url = new URL(requestOrigin);
    // Allow apex and any subdomain of quhealthy.org via HTTPS
    if (
      url.protocol === "https:" &&
      (url.hostname === "quhealthy.org" || url.hostname.endsWith(".quhealthy.org"))
    ) {
      return true;
    }
    // Allow local development (localhost, 127.0.0.1, admin.localhost, etc.)
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".localhost"))
    ) {
      return true;
    }
    // Allow Vercel preview environments
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app") &&
      url.hostname.includes("quhealthy")
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function getCorsHeaders(requestOrigin, requestHeaders) {
  const allowed = isOriginAllowed(requestOrigin);
  const allowOrigin = allowed ? requestOrigin : "https://www.quhealthy.org";

  const requestedHeaders = requestHeaders?.get?.("Access-Control-Request-Headers");
  const allowHeaders =
    requestedHeaders ||
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Device-Id, X-Timezone, Cache-Control, Pragma, X-Correlation-ID";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Expose-Headers": "Set-Cookie, Authorization, X-Correlation-ID",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function resolveUpstream(pathname) {
  // Wave 1
  if (pathname.startsWith("/api/auth")) {
    return PROD_UPSTREAMS.auth;
  }
  if (
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/intelligence") ||
    pathname.startsWith("/api/v1/intelligence")
  ) {
    return PROD_UPSTREAMS.analytics;
  }

  // Wave 2
  if (pathname.startsWith("/api/catalog")) {
    return PROD_UPSTREAMS.catalog;
  }
  if (pathname.startsWith("/api/onboarding")) {
    return PROD_UPSTREAMS.onboarding;
  }
  if (pathname.startsWith("/api/appointments")) {
    return PROD_UPSTREAMS.appointment;
  }

  // Wave 3
  if (
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/admin/notifications")
  ) {
    return PROD_UPSTREAMS.notification;
  }
  if (
    pathname.startsWith("/api/referrals") ||
    pathname.startsWith("/api/admin/referrals")
  ) {
    return PROD_UPSTREAMS.referral;
  }
  if (pathname.startsWith("/api/reviews")) {
    return PROD_UPSTREAMS.review;
  }

  // Wave 4
  if (
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/admin/plans")
  ) {
    return PROD_UPSTREAMS.payment;
  }
  if (pathname.startsWith("/api/social")) {
    return PROD_UPSTREAMS.social;
  }
  if (
    pathname.startsWith("/api/health-agent") ||
    pathname.startsWith("/api/v1/health-agent")
  ) {
    return PROD_UPSTREAMS.healthAgent;
  }
  if (
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/sba-settings.js") ||
    pathname.startsWith("/variables.css") ||
    pathname.startsWith("/instances") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/api/admin")
  ) {
    return PROD_UPSTREAMS.admin;
  }

  // Fallback to auth-service for general API or root
  return PROD_UPSTREAMS.auth;
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
            environment: "production",
            gateway: "api.quhealthy.org",
            services: {
              auth: PROD_UPSTREAMS.auth,
              catalog: PROD_UPSTREAMS.catalog,
              onboarding: PROD_UPSTREAMS.onboarding,
              appointment: PROD_UPSTREAMS.appointment,
              analytics: PROD_UPSTREAMS.analytics,
              notification: PROD_UPSTREAMS.notification,
              referral: PROD_UPSTREAMS.referral,
              review: PROD_UPSTREAMS.review,
              payment: PROD_UPSTREAMS.payment,
              social: PROD_UPSTREAMS.social,
              admin: PROD_UPSTREAMS.admin,
              healthAgent: PROD_UPSTREAMS.healthAgent,
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
            ...getCorsHeaders(origin, request.headers),
          },
        }
      );
    }

    // 2. Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin, request.headers),
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

      // Overwrite/ensure correct CORS headers on all responses
      const cors = getCorsHeaders(origin, request.headers);
      for (const [key, value] of Object.entries(cors)) {
        responseHeaders.set(key, value);
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
            ...getCorsHeaders(origin, request.headers),
          },
        }
      );
    }
  },
};
