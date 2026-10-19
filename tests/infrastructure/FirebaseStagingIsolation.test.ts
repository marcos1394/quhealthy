import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isStagingEnvironment } from "@/lib/firebase";

describe("Firebase Staging Isolation (Mandato Iteración 2.5)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  const originalLocation = window.location;

  const setMockLocation = (urlStr: string) => {
    const url = new URL(urlStr);
    Object.defineProperty(window, "location", {
      value: url,
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("identifies canonical staging host 'staging.quhealthy.org' as staging environment", () => {
    setMockLocation("https://staging.quhealthy.org/es/discover");
    expect(isStagingEnvironment()).toBe(true);
  });

  it("identifies preview staging deployment host containing 'staging' as staging environment", () => {
    setMockLocation("https://quhealthy-git-stage-preview-marcos1394s-projects.vercel.app/es/login");
    expect(isStagingEnvironment()).toBe(true);
  });

  it("identifies staging when NEXT_PUBLIC_API_URL points to api-staging.quhealthy.org", () => {
    setMockLocation("http://localhost:3000/es/discover");
    process.env.NEXT_PUBLIC_API_URL = "https://api-staging.quhealthy.org";
    expect(isStagingEnvironment()).toBe(true);
  });

  it("identifies production host 'www.quhealthy.org' as NOT staging", () => {
    setMockLocation("https://www.quhealthy.org/es/discover");
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";
    expect(isStagingEnvironment()).toBe(false);
  });

  it("identifies apex production host 'quhealthy.org' as NOT staging", () => {
    setMockLocation("https://quhealthy.org/es/discover");
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org";
    expect(isStagingEnvironment()).toBe(false);
  });

  it("guarantees Firebase is not initialized with productive config in staging environment", async () => {
    setMockLocation("https://staging.quhealthy.org/es/discover");
    process.env.NEXT_PUBLIC_API_URL = "https://api-staging.quhealthy.org";

    const firebaseModule = await import("@/lib/firebase");
    expect(firebaseModule.isStagingEnvironment()).toBe(true);
    // En staging, db debe ser null evitando inicializar el listener hacia quhealthy-backend
    expect(firebaseModule.db).toBeNull();
  });
});
