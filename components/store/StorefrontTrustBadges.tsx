"use client";

import React, { useMemo } from "react";
import {
  ShieldCheck,
  Truck,
  Receipt,
  Lock,
  Award,
  FileText,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

import { StorefrontData } from "@/types/storefront";
import { ProviderScoreResponse } from "@/types/providerScore";
import { cn } from "@/lib/utils";

interface StorefrontTrustBadgesProps {
  store: StorefrontData;
  scoreData?: ProviderScoreResponse | null;
  brandColor?: string;
  className?: string;
}

export const StorefrontTrustBadges: React.FC<StorefrontTrustBadgesProps> = ({
  store,
  scoreData,
  brandColor = "#059669",
  className,
}) => {
  const safePrimaryColor =
    brandColor && brandColor !== "#ffffff" ? brandColor : "#059669";

  // Identificar si el perfil es de insumos / distribuidor / farmacia o principalmente venta de productos
  const isSupplierOrProductStore = useMemo(() => {
    if (store.providerType === "SUPPLIER" || store.providerType === "PHARMACY") {
      return true;
    }
    const productCount = store.products?.length || 0;
    const serviceCount = store.services?.length || 0;
    if (productCount > 0 && serviceCount === 0) {
      return true;
    }
    return false;
  }, [store.providerType, store.products, store.services]);

  // Lista de insignias adaptadas al contexto
  const badges = useMemo(() => {
    if (isSupplierOrProductStore) {
      return [
        {
          icon: ShieldCheck,
          title: "Insumos Médicos Verificados",
          description: store.cofeprisNotice
            ? `Aviso de Funcionamiento COFEPRIS: ${store.cofeprisNotice}`
            : "Material de curación, reactivos y dispositivos con trazabilidad y registro sanitario.",
        },
        {
          icon: Truck,
          title: store.coldChainCertified
            ? "Cadena de Frío & Envío Asegurado"
            : "Envíos Asegurados a Todo México",
          description: store.coldChainCertified
            ? "Monitoreo térmico continuo certificado para biológicos e insumos sensibles."
            : "Cobertura logística nacional con empaque de protección médica y rastreo en tiempo real.",
        },
        {
          icon: Receipt,
          title: "Facturación SAT CFDI 4.0",
          description:
            "Emisión formal de factura electrónica deducible para clínicas, hospitales y profesionales.",
        },
        {
          icon: Lock,
          title: "Pago Seguro SSL en Garantía",
          description:
            "Transacciones encriptadas. Tus fondos se resguardan de forma segura hasta confirmar la entrega.",
        },
      ];
    }

    return [
      {
        icon: Award,
        title: "Profesionales de Salud Verificados",
        description: store.doctorLicense
          ? `Cédula Profesional Auditada: ${store.doctorLicense}`
          : "Cédulas y credenciales médicas verificadas ante la SEP y Secretaría de Salud.",
      },
      {
        icon: FileText,
        title: "Expediente Digital NOM-004",
        description:
          "Notas médicas, recetas y datos clínicos con cifrado de grado hospitalario bajo la norma oficial.",
      },
      {
        icon: CalendarCheck,
        title: "Confirmación Inmediata de Cita",
        description: store.cancellationPolicy
          ? "Políticas claras de reprogramación y cancelación flexible en 1 clic."
          : "Confirmación al instante con recordatorios automáticos vía WhatsApp.",
      },
      {
        icon: Lock,
        title: "Pago Seguro y Retención en Garantía",
        description:
          "Tu pago se mantiene en garantía protegida hasta que tu consulta o procedimiento concluya con éxito.",
      },
    ];
  }, [isSupplierOrProductStore, store.cofeprisNotice, store.coldChainCertified, store.doctorLicense, store.cancellationPolicy]);

  return (
    <section
      data-testid="storefront-trust-badges"
      aria-label="Garantías de confianza QuHealthy"
      className={cn(
        "p-6 sm:p-8 rounded-3xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800/80 transition-all font-sans",
        className
      )}
    >
      {/* CABECERA DE LA FRANJA DE CONFIANZA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/60 dark:border-gray-800/80">
        <div>
          <h3 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: safePrimaryColor }}
            />
            <span>
              {isSupplierOrProductStore
                ? "Garantías de Cumplimiento y Calidad en Insumos"
                : "Garantías de Confianza y Calidad Médica"}
            </span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isSupplierOrProductStore
              ? "Todos los distribuidores y productos en QuHealthy operan bajo estándares de calidad y formalidad fiscal."
              : "Tu bienestar es prioridad: todos los especialistas en QuHealthy cumplen con la regulación sanitaria vigente."}
          </p>
        </div>

        {scoreData && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 px-3.5 py-1.5 rounded-2xl shadow-2xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-black">
              QuScore {scoreData.score} / 1000
            </span>
            <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider">
              • Verificado
            </span>
          </div>
        )}
      </div>

      {/* GRILLA DE 4 PILARES DE CONFIANZA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.title}
              className="p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-start"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${safePrimaryColor}15`,
                  color: safePrimaryColor,
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                {badge.title}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
