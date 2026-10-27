import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";
import { calendarIntegrationService } from "@/services/calendar-integration.service";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/handleApiError", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@/services/calendar-integration.service", () => ({
  calendarIntegrationService: {
    getStatus: vi.fn(),
    getConnectUrl: vi.fn(),
    syncNow: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe("useCalendarIntegration (ENG-CAL-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("fetches Google Calendar connection status and lastSyncedAt on mount", async () => {
    vi.mocked(calendarIntegrationService.getStatus).mockResolvedValue({
      connected: true,
      provider: "GOOGLE_CALENDAR",
      lastSyncedAt: "2026-10-26T18:00:00Z",
    });

    const { result } = renderHook(() => useCalendarIntegration());

    await waitFor(() => {
      expect(result.current.isCheckingGoogle).toBe(false);
    });

    expect(result.current.isGoogleConnected).toBe(true);
    expect(result.current.lastSyncedAt).toBe("2026-10-26T18:00:00Z");
  });

  it("handles OAuth callback calendar_status=success and cleans URL", async () => {
    mockSearchParams = new URLSearchParams("calendar_status=success&provider=GOOGLE_CALENDAR");
    vi.mocked(calendarIntegrationService.getStatus).mockResolvedValue({
      connected: true,
      provider: "GOOGLE_CALENDAR",
    });

    const { result } = renderHook(() => useCalendarIntegration());

    await waitFor(() => {
      expect(result.current.isGoogleConnected).toBe(true);
    });

    expect(mockReplace).toHaveBeenCalledWith("/provider/dashboard/calendar");
  });

  it("triggers manual bidirectional sync via handleSyncNow", async () => {
    vi.mocked(calendarIntegrationService.getStatus).mockResolvedValue({
      connected: true,
      provider: "GOOGLE_CALENDAR",
    });
    vi.mocked(calendarIntegrationService.syncNow).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCalendarIntegration());

    await waitFor(() => {
      expect(result.current.isCheckingGoogle).toBe(false);
    });

    await act(async () => {
      await result.current.handleSyncNow();
    });

    expect(calendarIntegrationService.syncNow).toHaveBeenCalledTimes(1);
    expect(calendarIntegrationService.getStatus).toHaveBeenCalledTimes(2);
  });

  it("disconnects Google Calendar and resets connection state", async () => {
    vi.mocked(calendarIntegrationService.getStatus).mockResolvedValue({
      connected: true,
      provider: "GOOGLE_CALENDAR",
      lastSyncedAt: "2026-10-26T18:00:00Z",
    });
    vi.mocked(calendarIntegrationService.disconnect).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCalendarIntegration());

    await waitFor(() => {
      expect(result.current.isGoogleConnected).toBe(true);
    });

    await act(async () => {
      await result.current.handleDisconnect();
    });

    expect(calendarIntegrationService.disconnect).toHaveBeenCalledTimes(1);
    expect(result.current.isGoogleConnected).toBe(false);
    expect(result.current.lastSyncedAt).toBeNull();
  });
});
