"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type PulsoState =
  | "idle"
  | "thinking"
  | "listening"
  | "scanning"
  | "success"
  | "happy"
  | "wink"
  | "error";

interface PulsoMascotProps {
  state?: PulsoState;
  size?: number;
  className?: string;
  onClick?: () => void;
  showHalo?: boolean;
}

export const PulsoPalette = {
  body: "#5DCAA5",
  accent: "#1D9E75",
  highlight: "#E1F5EE",
  ink: "#04342C",
  sparkle: "#0F6E56",
};

export function PulsoMascot({
  state = "idle",
  size = 48,
  className = "",
  onClick,
  showHalo = false,
}: PulsoMascotProps) {
  const [internalState, setInternalState] = useState<PulsoState>(state);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInternalState(state);
  }, [state]);

  const activeState =
    isHovered && internalState === "idle" ? "wink" : internalState;

  const isThinking = activeState === "thinking";
  const isScanning = activeState === "scanning" || activeState === "listening";
  const isHappy = activeState === "success" || activeState === "happy";
  const isWink = activeState === "wink";
  const isError = activeState === "error";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none cursor-pointer transition-transform duration-200 active:scale-95",
        className
      )}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setInternalState("wink");
        setTimeout(() => setInternalState(state), 1400);
        if (onClick) onClick();
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        {/* Halo / Anillo de Escucha / Escaneo */}
        {isScanning && (
          <circle
            cx="50"
            cy="50"
            r="54"
            fill="none"
            stroke={PulsoPalette.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="30 250"
            className="animate-spin origin-center"
            style={{ animationDuration: "1.2s" }}
          />
        )}

        {/* Manos / Brazos laterales */}
        <rect
          x="6"
          y="48"
          width="9"
          height="20"
          rx="4.5"
          fill={PulsoPalette.accent}
          className={cn(
            "transition-transform origin-bottom duration-300",
            isHappy ? "-rotate-45 -translate-y-2" : "rotate-12"
          )}
        />
        <rect
          x="85"
          y="48"
          width="9"
          height="20"
          rx="4.5"
          fill={PulsoPalette.accent}
          className={cn(
            "transition-transform origin-bottom duration-300",
            isHappy ? "rotate-45 -translate-y-2" : "-rotate-12"
          )}
        />

        {/* Cuerpo redondo */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill={PulsoPalette.body}
          className={cn(
            "transition-transform duration-700",
            activeState === "idle" && "animate-pulse"
          )}
        />

        {/* Brillo / Highlight superior izquierdo (exacto a iOS) */}
        <ellipse
          cx="34"
          cy="28"
          rx="17"
          ry="10"
          transform="rotate(-25 34 28)"
          fill={PulsoPalette.highlight}
          opacity="0.85"
        />

        {/* Ojos */}
        <g className="transition-all duration-300">
          {/* Cejas para estado de error */}
          {isError && (
            <>
              <line
                x1="30"
                y1="34"
                x2="44"
                y2="38"
                stroke={PulsoPalette.ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="70"
                y1="34"
                x2="56"
                y2="38"
                stroke={PulsoPalette.ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Ojo Izquierdo */}
          {isHappy ? (
            <path
              d="M 30 48 Q 38 38 46 48"
              fill="none"
              stroke={PulsoPalette.ink}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ) : (
            <g>
              <circle
                cx="38"
                cy="46"
                r={isThinking ? 5.5 : 7}
                fill={PulsoPalette.ink}
              />
              <circle cx="35.5" cy="43.5" r="2.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Ojo Derecho */}
          {isHappy || isWink ? (
            <path
              d="M 54 48 Q 62 38 70 48"
              fill="none"
              stroke={PulsoPalette.ink}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ) : (
            <g>
              <circle
                cx="62"
                cy="46"
                r={isThinking ? 5.5 : 7}
                fill={PulsoPalette.ink}
              />
              <circle cx="59.5" cy="43.5" r="2.2" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* Sonrisa (Boca siempre suave y feliz) */}
        <path
          d={
            isHappy
              ? "M 32 58 Q 50 78 68 58"
              : isThinking
              ? "M 36 62 Q 50 67 64 62"
              : "M 33 60 Q 50 73 67 60"
          }
          fill="none"
          stroke={PulsoPalette.ink}
          strokeWidth="3.4"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Puntos de Pensamiento (Thinking Bubble arriba de la cabeza) */}
        {isThinking && (
          <g className="animate-bounce" style={{ animationDuration: "1s" }}>
            <rect
              x="30"
              y="-10"
              width="40"
              height="16"
              rx="8"
              fill="#FFFFFF"
              stroke={PulsoPalette.accent}
              strokeWidth="1.5"
            />
            <circle cx="40" cy="-2" r="2.5" fill={PulsoPalette.accent} />
            <circle cx="50" cy="-2" r="2.5" fill={PulsoPalette.accent} />
            <circle cx="60" cy="-2" r="2.5" fill={PulsoPalette.accent} />
          </g>
        )}

        {/* Estrellita de Éxito / Sparkle */}
        {isHappy && (
          <path
            d="M 86 18 Q 86 28 96 28 Q 86 28 86 38 Q 86 28 76 28 Q 86 28 86 18"
            fill={PulsoPalette.sparkle}
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}
