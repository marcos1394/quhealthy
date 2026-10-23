import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveApiBaseUrl } from "@/lib/api-config";

describe("API Base URL Resolution Regression (STAGE-WEB-CANON-01 & Mandato Iteración 2.5)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  const originalLocation = window.location;

  const setMockHost = (hostname: string) => {
    Object.defineProperty(window, "location", {
      value: new URL(`https://${hostname}/es/discover`),
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("NUNCA contacta api.quhealthy.org en staging.quhealthy.org incluso si NEXT_PUBLIC_API_URL apunta a producción", () => {
    setMockHost("staging.quhealthy.org");
    // Simular variable de entorno mal configurada heredada de producción
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).not.toBe("https://api.quhealthy.org");
    expect(resolved).toBe("https://api-staging.quhealthy.org");
  });

  it("resuelve hacia api-staging.quhealthy.org en staging.quhealthy.org si NEXT_PUBLIC_API_URL está vacía o indefinida", () => {
    setMockHost("staging.quhealthy.org");
    delete process.env.NEXT_PUBLIC_API_URL;

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api-staging.quhealthy.org");
  });

  it("resuelve hacia api-staging.quhealthy.org en staging.quhealthy.org si NEXT_PUBLIC_API_URL apunta al apex productivo", () => {
    setMockHost("staging.quhealthy.org");
    process.env.NEXT_PUBLIC_API_URL = "https://quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api-staging.quhealthy.org");
  });

  it("protege previews de Vercel de ramas stage/staging si NEXT_PUBLIC_API_URL apunta a producción", () => {
    setMockHost("quhealthy-git-feat-stage-web-canon-01-marcos1394s-projects.vercel.app");
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api-staging.quhealthy.org");
  });

  it("acepta configuración legítima de staging si NEXT_PUBLIC_API_URL incluye staging", () => {
    setMockHost("staging.quhealthy.org");
    process.env.NEXT_PUBLIC_API_URL = "https://api-staging.quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api-staging.quhealthy.org");
  });

  it("conserva intacta la resolución hacia producción cuando el host es www.quhealthy.org", () => {
    setMockHost("www.quhealthy.org");
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api.quhealthy.org");
  });

  it("conserva intacta la resolución hacia producción cuando el host es el apex quhealthy.org", () => {
    setMockHost("quhealthy.org");
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("https://api.quhealthy.org");
  });

  it("permite URL de backend local en desarrollo cuando el host es localhost", () => {
    setMockHost("localhost");
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

    const resolved = resolveApiBaseUrl();
    expect(resolved).toBe("http://localhost:8080");
  });
});
