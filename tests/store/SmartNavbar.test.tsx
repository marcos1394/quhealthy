import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Navbar } from "@/components/Navbar";
import { useSessionStore } from "@/stores/SessionStore";

vi.mock("next-intl", () => ({
  useLocale: () => "es",
  useTranslations: () => (key: string, opts?: any) => opts?.defaultValue || key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/store/asap-medix",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/i18n/routing", () => ({
  usePathname: () => "/store/asap-medix",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock("@/hooks/useBookingStore", () => ({
  useBookingStore: () => ({
    cart: [],
    openCart: vi.fn(),
  }),
}));

describe("SmartNavbar Component (Auto-hide on scroll down, reveal on scroll up)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,
      _hasHydrated: true,
      isLoading: false,
    });
    window.scrollY = 0;
  });

  it("renders with smart-navbar test ID and is initially visible at top of page", () => {
    render(<Navbar />);

    const header = screen.getByTestId("smart-navbar");
    expect(header).toBeDefined();
    expect(header.getAttribute("data-visible")).toBe("true");
    expect(header.className).toContain("translate-y-0");
    expect(header.className).toContain("fixed top-0");
  });

  it("hides with -translate-y-full when scrolling down past threshold", () => {
    // Mock requestAnimationFrame to run immediately
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<Navbar />);
    const header = screen.getByTestId("smart-navbar");

    // Scroll down to 120px
    act(() => {
      window.scrollY = 120;
      fireEvent.scroll(window);
    });

    expect(header.getAttribute("data-visible")).toBe("false");
    expect(header.className).toContain("-translate-y-full");
  });

  it("reappears with translate-y-0 when user scrolls up", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<Navbar />);
    const header = screen.getByTestId("smart-navbar");

    // First scroll down to hide
    act(() => {
      window.scrollY = 200;
      fireEvent.scroll(window);
    });
    expect(header.getAttribute("data-visible")).toBe("false");

    // Then scroll up by 30px
    act(() => {
      window.scrollY = 170;
      fireEvent.scroll(window);
    });

    expect(header.getAttribute("data-visible")).toBe("true");
    expect(header.className).toContain("translate-y-0");
  });

  it("always stays visible when returned to near the top of the page", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    render(<Navbar />);
    const header = screen.getByTestId("smart-navbar");

    // Scroll down
    act(() => {
      window.scrollY = 300;
      fireEvent.scroll(window);
    });
    expect(header.getAttribute("data-visible")).toBe("false");

    // Scroll back to top
    act(() => {
      window.scrollY = 10;
      fireEvent.scroll(window);
    });

    expect(header.getAttribute("data-visible")).toBe("true");
    expect(header.className).toContain("translate-y-0");
  });
});
