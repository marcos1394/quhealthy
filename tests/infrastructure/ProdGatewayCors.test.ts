import { describe, it, expect } from "vitest";
import worker from "@/infrastructure/cloudflare-prod-gateway/worker.js";

describe("Production Gateway CORS Isolation (PORT-D-01 Compliance)", () => {
  it("allows production origins such as apex, www and admin", async () => {
    const origins = [
      "https://quhealthy.org",
      "https://www.quhealthy.org",
      "https://admin.quhealthy.org",
    ];

    for (const origin of origins) {
      const request = new Request("https://api.quhealthy.org/healthz", {
        headers: { Origin: origin },
      });
      const response = await worker.fetch(request, {}, {});
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    }
  });

  it("strictly disallows staging origins from accessing production API", async () => {
    const stagingOrigins = [
      "https://staging.quhealthy.org",
      "https://api-staging.quhealthy.org",
      "https://preview-staging.quhealthy.org",
    ];

    for (const origin of stagingOrigins) {
      const request = new Request("https://api.quhealthy.org/healthz", {
        headers: { Origin: origin },
      });
      const response = await worker.fetch(request, {}, {});
      // When origin is disallowed, worker must NOT reflect the staging origin
      expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe(origin);
      // Fallback is default apex
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://www.quhealthy.org");
    }
  });

  it("strictly disallows arbitrary unauthorized external origins", async () => {
    const request = new Request("https://api.quhealthy.org/healthz", {
      headers: { Origin: "https://malicious-attacker.com" },
    });
    const response = await worker.fetch(request, {}, {});
    expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe("https://malicious-attacker.com");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://www.quhealthy.org");
  });

  it("responds to OPTIONS preflight without reflecting staging origin", async () => {
    const request = new Request("https://api.quhealthy.org/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: "https://staging.quhealthy.org",
        "Access-Control-Request-Method": "POST",
      },
    });
    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).not.toBe("https://staging.quhealthy.org");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://www.quhealthy.org");
  });
});
