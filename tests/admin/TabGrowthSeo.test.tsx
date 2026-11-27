import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabGrowthSeo } from "@/app/[locale]/admin/dashboard/tabs/TabGrowthSeo";
import type { GrowthOverviewDTO } from "@/services/admin.service";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

const mockGrowthOverview: GrowthOverviewDTO = {
  periodDays: 30,
  generatedAt: "2026-11-27T00:00:00Z",
  cached: true,
  searchConsole: {
    connected: true,
    siteUrl: "sc-domain:quhealthy.org",
    totals: { clicks: 180, impressions: 10688, ctr: 1.68, avgPosition: 10.6 },
    previousTotals: { clicks: 120, impressions: 8000, ctr: 1.5, avgPosition: 12.1 },
    clicksDeltaPct: 50,
    impressionsDeltaPct: 33.6,
    ctrDeltaPct: 0.18,
    positionDelta: 1.5,
    dailyTrend: [{ date: "2026-11-26", clicks: 12, impressions: 420, ctr: 2.8, position: 9.2 }],
    topQueries: [
      { query: "sonicision 7", clicks: 2, impressions: 196, ctr: 1.0, position: 7.1 },
      { query: "absorbatack precio", clicks: 1, impressions: 52, ctr: 1.9, position: 5.1 },
    ],
    quickWinQueries: [
      {
        query: "sonicision 7",
        clicks: 2,
        impressions: 196,
        ctr: 1.0,
        position: 7.1,
        estimatedExtraClicks: 14,
        recommendation: "Optimiza título con precio MXN",
      },
    ],
    topPages: [
      {
        page: "https://www.quhealthy.org/es/market/item/284-absorbatack-15-5mm",
        clicks: 7,
        impressions: 243,
        ctr: 2.9,
        position: 6.5,
      },
    ],
    countries: [{ key: "mex", clicks: 144, impressions: 5488, ctr: 2.6, position: 8.7 }],
    devices: [{ key: "MOBILE", clicks: 107, impressions: 5800, ctr: 1.8, position: 7.8 }],
    sitemaps: [
      {
        path: "https://www.quhealthy.org/sitemap.xml",
        submitted: 366,
        indexed: 0,
        warnings: 0,
        errors: 0,
        lastDownloaded: "2026-11-27T00:00:00Z",
      },
    ],
  },
  ga4: {
    connected: true,
    propertyId: "523194200",
    totals: {
      activeUsers: 196,
      newUsers: 180,
      sessions: 789,
      engagedSessions: 449,
      engagementRate: 56.9,
      screenPageViews: 2427,
      avgSessionDurationSec: 294,
    },
    previousTotals: {
      activeUsers: 150,
      newUsers: 140,
      sessions: 600,
      engagedSessions: 320,
      engagementRate: 53.3,
      screenPageViews: 1900,
      avgSessionDurationSec: 240,
    },
    usersDeltaPct: 30.67,
    sessionsDeltaPct: 31.5,
    pageViewsDeltaPct: 27.7,
    dailyTrend: [{ date: "2026-11-26", activeUsers: 22, sessions: 45, screenPageViews: 120 }],
    channels: [
      { channel: "Organic Social", sessions: 191, activeUsers: 72, engagedSessions: 109, engagementRate: 57.1 },
      { channel: "Organic Search", sessions: 236, activeUsers: 54, engagedSessions: 139, engagementRate: 58.9 },
    ],
    topPages: [{ pagePath: "/es/market/item/284-absorbatack-15-5mm", views: 23, activeUsers: 6 }],
    keyEvents: [
      { eventName: "view_item", count: 42 },
      { eventName: "sign_up", count: 8 },
    ],
    topCities: [{ city: "Los Mochis", country: "Mexico", activeUsers: 38, sessions: 95 }],
  },
  insights: [],
};

describe("Admin v2: TabGrowthSeo (Search Console + GA4)", () => {
  it("renders Search Console KPIs, Quick Wins SEO, and sitemap status", () => {
    render(
      <TabGrowthSeo
        growthOverview={mockGrowthOverview}
        productMetrics={null}
        isLoadingGrowth={false}
        growthDays={30}
        onChangeGrowthDays={vi.fn()}
        onForceRefreshGrowth={vi.fn()}
      />
    );

    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("10,688")).toBeInTheDocument();
    expect(screen.getByText(/Quick Wins SEO/i)).toBeInTheDocument();
    expect(screen.getByText("+14 clics")).toBeInTheDocument();
    expect(screen.getByText("366 enviadas")).toBeInTheDocument();
  });

  it("switches to GA4 sub-tab and renders acquisition channels, key events, and cities", () => {
    render(
      <TabGrowthSeo
        growthOverview={mockGrowthOverview}
        productMetrics={null}
        isLoadingGrowth={false}
        growthDays={30}
        onChangeGrowthDays={vi.fn()}
        onForceRefreshGrowth={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tráfico & Embudo GA4/i }));

    expect(screen.getByText("Organic Social")).toBeInTheDocument();
    expect(screen.getByText("Organic Search")).toBeInTheDocument();
    expect(screen.getByText("Vistas de Producto/Servicio")).toBeInTheDocument();
    expect(screen.getByText("Registros Completados")).toBeInTheDocument();
    expect(screen.getByText("Los Mochis")).toBeInTheDocument();
  });

  it("triggers force refresh and period changes via callbacks", () => {
    const onDays = vi.fn();
    const onRefresh = vi.fn();

    render(
      <TabGrowthSeo
        growthOverview={mockGrowthOverview}
        productMetrics={null}
        isLoadingGrowth={false}
        growthDays={30}
        onChangeGrowthDays={onDays}
        onForceRefreshGrowth={onRefresh}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "90d" }));
    expect(onDays).toHaveBeenCalledWith(90);

    fireEvent.click(screen.getByRole("button", { name: /Sincronizar en vivo/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
