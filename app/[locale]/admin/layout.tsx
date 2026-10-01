import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "QuHealthy Command Center | Panel Administrativo",
  description: "Superficie administrativa y operativa centralizada de QuHealthy.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-surface-root min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
