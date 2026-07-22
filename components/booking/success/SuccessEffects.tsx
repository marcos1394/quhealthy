"use client";

import React from "react";

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      {/* Patrón de grilla técnica de fondo en lugar de blur de colores */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// El confeti festivo se anula para mantener el rigor clínico.
export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return null;
}
