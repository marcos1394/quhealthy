import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTeleconsultationTimer } from "@/hooks/useTeleconsultationTimer";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";

describe("useTeleconsultationTimer (ENG-TELEMED-01)", () => {
  beforeEach(() => {
    act(() => {
      useTeleconsultationStore.setState({
        state: "CONNECTED",
        remainingSeconds: null,
        serverEndTime: null,
      });
    });
  });

  it("returns fallback format '--:--' when remainingSeconds is null", () => {
    const { result } = renderHook(() => useTeleconsultationTimer());
    expect(result.current.remainingSeconds).toBeNull();
    expect(result.current.formattedTime).toBe("--:--");
    expect(result.current.isWarning).toBe(false);
    expect(result.current.isCritical).toBe(false);
  });

  it("correctly formats MM:SS for normal countdown", () => {
    act(() => {
      useTeleconsultationStore.getState().updateRemainingSeconds(750); // 12m 30s
    });

    const { result } = renderHook(() => useTeleconsultationTimer());
    expect(result.current.remainingSeconds).toBe(750);
    expect(result.current.formattedTime).toBe("12:30");
    expect(result.current.isWarning).toBe(false);
    expect(result.current.isCritical).toBe(false);
  });

  it("activates warning flag when remainingSeconds <= 300 and > 60", () => {
    act(() => {
      useTeleconsultationStore.getState().updateRemainingSeconds(300); // 5 min boundary
    });

    const { result } = renderHook(() => useTeleconsultationTimer());
    expect(result.current.formattedTime).toBe("05:00");
    expect(result.current.isWarning).toBe(true);
    expect(result.current.isCritical).toBe(false);

    act(() => {
      useTeleconsultationStore.getState().updateRemainingSeconds(120); // 2 min
    });
    expect(result.current.isWarning).toBe(true);
    expect(result.current.isCritical).toBe(false);
  });

  it("activates critical flag when remainingSeconds <= 60", () => {
    act(() => {
      useTeleconsultationStore.getState().updateRemainingSeconds(60); // 1 min boundary
    });

    const { result } = renderHook(() => useTeleconsultationTimer());
    expect(result.current.formattedTime).toBe("01:00");
    expect(result.current.isWarning).toBe(false);
    expect(result.current.isCritical).toBe(true);

    act(() => {
      useTeleconsultationStore.getState().updateRemainingSeconds(15);
    });
    expect(result.current.formattedTime).toBe("00:15");
    expect(result.current.isCritical).toBe(true);
  });
});
