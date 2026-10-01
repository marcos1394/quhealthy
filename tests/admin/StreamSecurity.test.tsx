import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSocial, getStreamBaseUrl } from "@/hooks/useSocial";
import { useCrmStream } from "@/hooks/useCrmStream";
import { socialService } from "@/services/social.service";
import { useSessionStore } from "@/stores/SessionStore";

// Mock services & stores
vi.mock("@/services/social.service", () => ({
  socialService: {
    getActiveConnections: vi.fn(),
    getConversations: vi.fn(),
    getStreamTicket: vi.fn(),
    getAnalyticsDashboard: vi.fn(),
  },
}));

vi.mock("@/stores/SessionStore", () => ({
  useSessionStore: vi.fn(),
}));

describe("STREAM-SEC-01: Administrative Streaming Without Persistent URL Tokens", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockEventSourceInstances: any[] = [];

  class MockEventSource {
    url: string;
    listeners: { [key: string]: Function[] } = {};
    onerror: Function | null = null;
    onmessage: Function | null = null;
    readyState = 0;
    closed = false;

    constructor(url: string) {
      this.url = url;
      mockEventSourceInstances.push(this);
    }

    addEventListener(event: string, cb: Function) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(cb);
    }

    simulateEvent(event: string, data: any) {
      if (this.listeners[event]) {
        this.listeners[event].forEach((cb) => cb({ data: JSON.stringify(data) }));
      }
    }

    simulateRawMessage(data: any) {
      if (this.onmessage) {
        this.onmessage(new MessageEvent("message", { data: JSON.stringify(data) }));
      }
    }

    simulateError() {
      if (this.onerror) {
        this.onerror(new Event("error"));
      }
    }

    close() {
      this.closed = true;
      this.readyState = 2;
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    mockEventSourceInstances = [];

    // Setup global MockEventSource
    // @ts-ignore
    global.EventSource = MockEventSource;
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    // Mock session token
    vi.mocked(useSessionStore).mockReturnValue("mock-session-jwt-token-xyz");

    // Mock default ticket generation
    vi.mocked(socialService.getStreamTicket).mockResolvedValue({
      ticket: "sst_abc1234567890",
      expiresInSeconds: 30,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  it("RULE 1: Resolves base URL dynamically from environment variables without hardcoded Cloud Run URL", () => {
    // 1. Prioritizes NEXT_PUBLIC_SOCIAL_SERVICE_URL
    process.env.NEXT_PUBLIC_SOCIAL_SERVICE_URL = "https://custom-social.quhealthy.org/";
    process.env.NEXT_PUBLIC_API_URL = "https://api.quhealthy.org/";
    expect(getStreamBaseUrl()).toBe("https://custom-social.quhealthy.org");

    // 2. Falls back to NEXT_PUBLIC_API_URL
    delete process.env.NEXT_PUBLIC_SOCIAL_SERVICE_URL;
    expect(getStreamBaseUrl()).toBe("https://api.quhealthy.org");

    // 3. Falls back to relative empty string
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getStreamBaseUrl()).toBe("");

    // 4. Guarantees no legacy hardcoded Cloud Run origin
    expect(getStreamBaseUrl()).not.toContain("social-service-629639328783.us-central1.run.app");
  });

  it("RULE 2: Initiates SSE connection using single-use ephemeral ticket and NEVER exposes session JWT in URL", async () => {
    renderHook(() => useSocial());

    await vi.waitFor(() => {
      expect(socialService.getStreamTicket).toHaveBeenCalledTimes(1);
      expect(mockEventSourceInstances.length).toBe(1);
    });

    const esInstance = mockEventSourceInstances[0];

    // Absolute zero exposure of the persistent session JWT in the query string
    expect(esInstance.url).not.toContain("mock-session-jwt-token-xyz");
    expect(esInstance.url).not.toContain("?token=");
    expect(esInstance.url).not.toContain("&token=");

    // Strictly uses the ephemeral stream ticket parameter
    expect(esInstance.url).toContain("?ticket=sst_abc1234567890");
  });

  it("RULE 3: Transitions connection state upon successful handshake", async () => {
    const { result } = renderHook(() => useSocial());

    await vi.waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    const esInstance = mockEventSourceInstances[0];

    act(() => {
      esInstance.simulateEvent("CONNECTED", {});
    });

    expect(result.current.isStreamConnected).toBe(true);
    expect(result.current.isStreamDegraded).toBe(false);
  });

  it("RULE 4: On error, drops connection, sets degradation state, and acquires a FRESH ticket for reconnection", async () => {
    vi.useFakeTimers();

    let ticketCounter = 1;
    vi.mocked(socialService.getStreamTicket).mockImplementation(async () => ({
      ticket: `sst_ticket_attempt_${ticketCounter++}`,
      expiresInSeconds: 30,
    }));

    const { result } = renderHook(() => useSocial());

    // Flush initial promise
    await vi.advanceTimersByTimeAsync(10);
    expect(mockEventSourceInstances.length).toBe(1);
    expect(mockEventSourceInstances[0].url).toContain("?ticket=sst_ticket_attempt_1");

    // Simulate SSE disconnection
    act(() => {
      mockEventSourceInstances[0].simulateError();
    });

    // Verify first connection closed and state marked degraded
    expect(mockEventSourceInstances[0].closed).toBe(true);
    expect(result.current.isStreamConnected).toBe(false);
    expect(result.current.isStreamDegraded).toBe(true);

    // Advance timers for exponential backoff (attempt 1: ~2s)
    await vi.advanceTimersByTimeAsync(3000);

    // Verify reconnect acquired a BRAND NEW ticket (preventing replay attacks)
    expect(socialService.getStreamTicket).toHaveBeenCalledTimes(2);
    expect(mockEventSourceInstances.length).toBe(2);
    expect(mockEventSourceInstances[1].url).toContain("?ticket=sst_ticket_attempt_2");
    expect(mockEventSourceInstances[1].url).not.toContain("sst_ticket_attempt_1");
  });

  it("RULE 5: Properly tears down EventSource and cancels pending timers on unmount", async () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useSocial());
    await vi.advanceTimersByTimeAsync(10);

    expect(mockEventSourceInstances.length).toBe(1);
    const es = mockEventSourceInstances[0];
    expect(es.closed).toBe(false);

    unmount();

    expect(es.closed).toBe(true);
  });

  it("RULE 6: Shared useCrmStream hook dispatches events and maintains independent lifecycle", async () => {
    const onNewMessageMock = vi.fn();
    const onConnectedMock = vi.fn();

    const { result, unmount } = renderHook(() =>
      useCrmStream({
        onNewMessage: onNewMessageMock,
        onConnected: onConnectedMock,
      })
    );

    await vi.waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    const es = mockEventSourceInstances[0];
    expect(es.url).toContain("?ticket=sst_abc1234567890");

    act(() => {
      es.simulateEvent("CONNECTED", {});
      es.simulateEvent("NEW_MESSAGE", { id: "msg-123", content: "Hola doctor" });
    });

    expect(onConnectedMock).toHaveBeenCalledTimes(1);
    expect(onNewMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "msg-123", content: "Hola doctor" })
    );
    expect(result.current.isStreamConnected).toBe(true);

    unmount();
    expect(es.closed).toBe(true);
  });
});
