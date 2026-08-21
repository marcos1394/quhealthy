"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React from "react";
import {
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  MessageCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoundationPublicStorefront, FoundationProgram } from "@/types/foundation";

interface FoundationStickyActionCardProps {
  storefront: FoundationPublicStorefront;
  onApplyClick: () => void;
  primaryProgram?: FoundationProgram | null;
}

export const FoundationStickyActionCard: React.FC<FoundationStickyActionCardProps> = ({
  storefront,
  onApplyClick,
  primaryProgram,
}) => {
  const primaryColor = storefront.primaryColor || "#e11d48";
  const title = storefront.brandName || storefront.legalName;

  const handleWhatsApp = () => {
    if (!storefront.contactPhone) return;
    const cleanPhone = storefront.contactPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hola ${title}, me gustaría solicitar información sobre sus programas asistenciales de salud en QuHealthy.`
    );
    window.open(`https://wa.me/521${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl sticky top-24 space-y-6 transition-all font-sans select-none">
      {/* ── Encabezado Institucional ── */}
      <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 p-1 flex items-center justify-center shrink-0 shadow-2xs">
            {storefront.logoUrl ? (
              <img
                src={storefront.logoUrl}
                alt={title}
                className="w-full h-full object-contain object-center"
              />
            ) : (
              <HeartHandshake className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 block truncate">
              {storefront.organizationType || "Institución Asistencial"}
            </span>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
              {title}
            </h3>
          </div>
        </div>

        {/* Beneficio Destacado */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/10 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
              Beneficio del Programa
            </span>
            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
              100% Subsidio / Gratuito
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-black text-rose-600 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Botones de Acción Inmediata ── */}
      <div className="space-y-2.5">
        <Button
          onClick={onApplyClick}
          className="w-full h-12 rounded-2xl text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          style={{ backgroundColor: primaryColor }}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Solicitar Apoyo Médico</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        {storefront.contactPhone && (
          <Button
            type="button"
            variant="outline"
            onClick={handleWhatsApp}
            className="w-full h-11 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Consultar por WhatsApp</span>
          </Button>
        )}
      </div>

      {/* ── Información de Contacto y Atención ── */}
      <div className="space-y-3 pt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Horario de Atención
            </span>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Lunes a Viernes: 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>

        {storefront.addressCity && (
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Sede Principal
              </span>
              <p className="text-gray-700 dark:text-gray-300">
                {storefront.addressCity}, {storefront.addressState || "México"}
              </p>
            </div>
          </div>
        )}

        {storefront.contactEmail && (
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Correo Institucional
              </span>
              <p className="text-gray-700 dark:text-gray-300 truncate">
                {storefront.contactEmail}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Garantía de Confidencialidad y Ética Médica ── */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Tus datos médicos y socioeconómicos se encuentran protegidos bajo estrictos protocolos de confidencialidad y ética médica asistencial en QuHealthy.
          </p>
        </div>
      </div>
    </div>
  );
};
