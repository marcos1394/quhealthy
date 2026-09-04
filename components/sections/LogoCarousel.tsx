"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Award,
  Receipt,
  Lock,
  CheckCircle2,
  Scale,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RegulatoryStandard {
  id: string;
  acronym: string;
  name: string;
  detail: string;
  icon: React.ElementType;
  badge: string;
}

const standards: RegulatoryStandard[] = [
  {
    id: "nom004",
    acronym: "NOM-004-SSA3",
    name: "Expediente Clínico Electrónico",
    detail: "Norma Oficial Mexicana SSA",
    icon: FileText,
    badge: "Oficial SSA",
  },
  {
    id: "cofepris",
    acronym: "COFEPRIS",
    name: "Regulación Sanitaria",
    detail: "Aviso de Funcionamiento",
    icon: ShieldCheck,
    badge: "Regulado",
  },
  {
    id: "sep",
    acronym: "DGP • SEP",
    name: "Cédula Profesional",
    detail: "Validación Federal en Tiempo Real",
    icon: Award,
    badge: "SEP Verificado",
  },
  {
    id: "cfdi",
    acronym: "SAT CFDI 4.0",
    name: "Honorarios Médicos",
    detail: "Exento IVA Art. 15 Fracc. XIV LIVA",
    icon: Receipt,
    badge: "Fiscal SAT",
  },
  {
    id: "nom024",
    acronym: "NOM-024-SSA3",
    name: "Sistemas SIRES",
    detail: "Interoperabilidad en Salud",
    icon: Scale,
    badge: "Interoperable",
  },
  {
    id: "aes",
    acronym: "Cifrado AES-256",
    name: "Seguridad de Datos",
    detail: "Encriptación en Reposo y Tránsito",
    icon: Lock,
    badge: "Grado Bancario",
  },
  {
    id: "lfpdppp",
    acronym: "LFPDPPP",
    name: "Protección de Datos",
    detail: "Custodia Estricta de Salud",
    icon: CheckCircle2,
    badge: "Privacidad",
  },
  {
    id: "hl7",
    acronym: "HL7 & FHIR",
    name: "Estándar Clínico",
    detail: "Protocolo de Intercambio Médico",
    icon: Activity,
    badge: "Global Standard",
  },
];

export const LogoCarousel: React.FC = () => {
  return (
    <div className="w-full mt-16 mb-8 pt-10 border-t border-gray-100 dark:border-gray-800 font-sans">
      
      {/* ── HEADER CON BADGE Y LÍNEA DE SEPARACIÓN ──────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shrink-0 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Marco Normativo, Sanitario & Estándares Médicos en México</span>
        </span>
        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full rounded-full" />
      </div>

      {/* ── CAROUSEL CONTENEDOR FLOTANTE ────────────────────────────────── */}
      <div className="relative flex overflow-hidden w-full group py-2">
        
        {/* Máscaras de Degradado Suavizadas */}
        <div className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-gray-50/90 dark:from-[#050505] via-gray-50/40 dark:via-[#050505]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-gray-50/90 dark:from-[#050505] via-gray-50/40 dark:via-[#050505]/40 to-transparent z-10 pointer-events-none" />

        {/* Tira en movimiento infinito */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-4 md:gap-6 px-4 group-hover:[animation-play-state:paused]"
        >
          {[...standards, ...standards, ...standards].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-3.5 shrink-0 px-5 py-3 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-md hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group/card"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                      {item.acronym}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
};

export default LogoCarousel;