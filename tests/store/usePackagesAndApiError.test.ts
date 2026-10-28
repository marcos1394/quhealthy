import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePackages } from "@/hooks/usePackages";
import { packageService } from "@/services/package.service";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";
import { toast } from "react-toastify";

const mockT = vi.fn((key: string, opts?: any) => opts?.defaultValue || key);

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

vi.mock("@/services/package.service", () => ({
  packageService: {
    getMyPackages: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("usePackages Hook & Guest Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,
    });
  });

  it("does not call packageService.getMyPackages if user is not authenticated", async () => {
    const { result } = renderHook(() => usePackages());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(packageService.getMyPackages).not.toHaveBeenCalled();
    expect(result.current.packages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("calls packageService.getMyPackages when user is authenticated", async () => {
    useSessionStore.setState({
      token: "valid-token",
      user: { id: 10 } as any,
      isAuthenticated: true,
      role: "PATIENT" as any,
    });

    const mockPackages = [
      { id: 101, title: "Paquete Dental Preventivo", provider: { id: 5 } },
    ];
    vi.mocked(packageService.getMyPackages).mockResolvedValueOnce(mockPackages as any);

    const { result } = renderHook(() => usePackages());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(packageService.getMyPackages).toHaveBeenCalledTimes(1);
    expect(result.current.packages).toEqual(mockPackages);
  });
});

describe("handleApiError Defense Against Annoying Refresh Toasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,
    });
  });

  it("suppresses toast when error is from refresh-token endpoint", () => {
    const error = {
      config: { url: "/api/auth/refresh-token" },
      response: {
        status: 400,
        data: { message: "El token de refresco es requerido." },
      },
    };

    handleApiError(error);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("suppresses toast when error message mentions refresh token or token de refresco", () => {
    const error = {
      response: {
        status: 401,
        data: { message: "El refresh token no fue exitoso o ha expirado." },
      },
    };

    handleApiError(error);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("suppresses 401 toast when user has no active token (guest browsing)", () => {
    const error = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    };

    handleApiError(error);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows toast when an authenticated user experiences a normal error", () => {
    useSessionStore.setState({
      token: "valid-token",
      user: { id: 1 } as any,
      isAuthenticated: true,
      role: "PATIENT" as any,
    });

    const error = {
      response: {
        status: 500,
        data: { message: "Error interno del servidor al procesar la cita." },
      },
    };

    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith("Error interno del servidor al procesar la cita.");
  });
});
