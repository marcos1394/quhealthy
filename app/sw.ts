import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Filter out dangerous caching strategies:
// 1. Never intercept or cache cross-origin requests generically (breaks api.quhealthy.org, Stripe, etc.)
// 2. Never cache /api/ calls (they are dynamic backend mutations and queries)
// 3. Never cache /admin/* routes or admin subdomain navigation
const runtimeCaching = defaultCache
  .filter((entry) => {
    const cacheName = (entry.handler as { cacheName?: string })?.cacheName;
    if (cacheName === "cross-origin" || cacheName === "apis") {
      return false;
    }
    return true;
  })
  .map((entry) => {
    const originalMatcher = entry.matcher;
    if (typeof originalMatcher === "function") {
      return {
        ...entry,
        matcher: (options: any) => {
          const { url } = options;
          if (
            url.hostname.startsWith("api.") ||
            url.hostname.startsWith("admin.") ||
            url.pathname.startsWith("/api/") ||
            url.pathname.includes("/admin")
          ) {
            return false;
          }
          return originalMatcher(options);
        },
      };
    }
    return entry;
  });

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  runtimeCaching,
});

serwist.addEventListeners();
