import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminHeader } from "@/app/[locale]/admin/dashboard/components/AdminHeader";

describe("AdminHeader component", () => {
  const defaultProps = {
    selectedPeriod: "24h" as const,
    onSelectPeriod: vi.fn(),
    onRefresh: vi.fn(),
    isRefreshing: false,
    onLogout: vi.fn(),
    adminEmail: "admin@quhealthy.com",
  };

  it("renders the Command Center title and Live indicator", () => {
    render(<AdminHeader {...defaultProps} />);

    expect(screen.getByText("QuHealthy Command Center")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("triggers onSelectPeriod when a period button is clicked", () => {
    const onSelectPeriod = vi.fn();
    render(<AdminHeader {...defaultProps} onSelectPeriod={onSelectPeriod} />);

    const button7d = screen.getByText("7D");
    fireEvent.click(button7d);
    expect(onSelectPeriod).toHaveBeenCalledWith("7d");

    const button30d = screen.getByText("30D");
    fireEvent.click(button30d);
    expect(onSelectPeriod).toHaveBeenCalledWith("30d");
  });

  it("triggers onRefresh when the refresh button is clicked", () => {
    const onRefresh = vi.fn();
    render(<AdminHeader {...defaultProps} onRefresh={onRefresh} />);

    const refreshBtn = screen.getByTitle("Actualizar datos");
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button when isRefreshing is true", () => {
    render(<AdminHeader {...defaultProps} isRefreshing={true} />);

    const refreshBtn = screen.getByTitle("Actualizar datos");
    expect(refreshBtn).toBeDisabled();
  });

  it("triggers onLogout when Cerrar Sesión button is clicked", () => {
    const onLogout = vi.fn();
    render(<AdminHeader {...defaultProps} onLogout={onLogout} />);

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
