/**
 * QuHealthy Staging API Gateway
 * Cloudflare Worker for https://api-staging.quhealthy.org
 *
 * Routes incoming API requests to the corresponding GCP Cloud Run microservices
 * in the quhealthy-staging project, maintaining full parity with the production
 * GCP Cloud Load Balancer (url-map-quhealthy) while maintaining FinOps $0 cost in idle.
 *
 * Complete 12/12 Microservices Suite (Waves 1, 2, 3 & 4):
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

const STAGING_UPSTREAMS = {
  auth: "https://auth-service-ayzpmwrdkq-uc.a.run.app",
  catalog: "https://catalog-service-ayzpmwrdkq-uc.a.run.app",
  onboarding: "https://onboarding-service-ayzpmwrdkq-uc.a.run.app",
  appointment: "https://appointment-service-ayzpmwrdkq-uc.a.run.app",
  analytics: "https://analytics-service-ayzpmwrdkq-uc.a.run.app",
  notification: "https://notification-service-ayzpmwrdkq-uc.a.run.app",
  referral: "https://referral-service-ayzpmwrdkq-uc.a.run.app",
  review: "https://review-service-ayzpmwrdkq-uc.a.run.app",
  payment: "https://payment-service-ayzpmwrdkq-uc.a.run.app",
  social: "https://social-service-ayzpmwrdkq-uc.a.run.app",
  admin: "https://admin-service-ayzpmwrdkq-uc.a.run.app",
  healthAgent: "https://health-agent-service-ayzpmwrdkq-uc.a.run.app",
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
  // Wave 1
  if (pathname.startsWith("/api/auth")) {
    return STAGING_UPSTREAMS.auth;
  }
  if (
    pathname.startsWith("/api/intelligence") ||
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/admin/intelligence")
  ) {
    return STAGING_UPSTREAMS.analytics;
  }

  // Wave 2
  if (pathname.startsWith("/api/catalog")) {
    return STAGING_UPSTREAMS.catalog;
  }
  if (pathname.startsWith("/api/onboarding")) {
    return STAGING_UPSTREAMS.onboarding;
  }
  if (pathname.startsWith("/api/appointments")) {
    return STAGING_UPSTREAMS.appointment;
  }

  // Wave 3
  if (pathname.startsWith("/api/notifications")) {
    return STAGING_UPSTREAMS.notification;
  }
  if (
    pathname.startsWith("/api/referrals") ||
    pathname.startsWith("/api/loyalty") ||
    pathname.startsWith("/api/admin/referrals")
  ) {
    return STAGING_UPSTREAMS.referral;
  }
  if (
    pathname.startsWith("/api/reviews") ||
    pathname.startsWith("/api/admin/reviews")
  ) {
    return STAGING_UPSTREAMS.review;
  }

  // Wave 4
  if (
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/payment") ||
    pathname.startsWith("/api/admin/payments")
  ) {
    return STAGING_UPSTREAMS.payment;
  }
  if (
    pathname.startsWith("/api/social") ||
    pathname.startsWith("/api/corporate") ||
    pathname.startsWith("/api/admin/social")
  ) {
    return STAGING_UPSTREAMS.social;
  }
  if (
    pathname.startsWith("/api/v1/health-agent") ||
    pathname.startsWith("/api/health-agent")
  ) {
    return STAGING_UPSTREAMS.healthAgent;
  }
  if (
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/sba-settings.js") ||
    pathname.startsWith("/variables.css") ||
    pathname.startsWith("/instances") ||
    pathname.startsWith("/applications")
  ) {
    return STAGING_UPSTREAMS.admin;
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
              notification: STAGING_UPSTREAMS.notification,
              referral: STAGING_UPSTREAMS.referral,
              review: STAGING_UPSTREAMS.review,
              payment: STAGING_UPSTREAMS.payment,
              social: STAGING_UPSTREAMS.social,
              admin: STAGING_UPSTREAMS.admin,
              healthAgent: STAGING_UPSTREAMS.healthAgent,
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
