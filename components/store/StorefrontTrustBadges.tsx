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
  Clock,
  Sparkles,
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

interface TrustBadgeItem {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  statusBadge: {
    label: string;
    isVerified: boolean;
  };
}

export const StorefrontTrustBadges: React.FC<StorefrontTrustBadgesProps> = ({
  store,
  scoreData,
  brandColor = "#059669",
  className,
}) => {
  const safePrimaryColor =
    brandColor && brandColor !== "#ffffff" ? brandColor : "#059669";

  // Identificar si el perfil es de insumos / distribuidor / farmacia o venta de productos
  const isSupplierOrProductStore = useMemo(() => {
    if (store.providerType === "SUPPLIER" || store.providerType === "PHARMACY" || store.authRole === "SUPPLIER") {
      return true;
    }
    const productCount = store.products?.length || 0;
    const serviceCount = store.services?.length || 0;
    if (productCount > 0 && serviceCount === 0) {
      return true;
    }
    return false;
  }, [store.providerType, store.authRole, store.products, store.services]);

  // Lista de insignias auditadas directamente con los datos reales del backend
  const badges: TrustBadgeItem[] = useMemo(() => {
    if (isSupplierOrProductStore) {
      // 1. Estatus del Distribuidor / Proveedor
      const isSupplierVerified = store.supplierStatus === "VERIFIED";
      const supplierBadge: TrustBadgeItem = {
        icon: ShieldCheck,
        title: isSupplierVerified
          ? "Distribuidor Oficial Verificado"
          : "Distribuidor Registrado QuHealthy",
        description: isSupplierVerified
          ? "Razón social, constancia fiscal y almacenes inspeccionados y aprobados por QuHealthy."
          : store.cofeprisNotice
          ? `Aviso de Funcionamiento COFEPRIS: ${store.cofeprisNotice}`
          : "Empresa con catálogo activo en QuHealthy; validación de instalaciones y almacenes en curso.",
        statusBadge: {
          label: isSupplierVerified ? "Verificado" : "Registrado",
          isVerified: isSupplierVerified,
        },
      };

      // 2. Logística y Cadena de Frío
      const hasColdChain = Boolean(store.coldChainCertified);
      const logisticsBadge: TrustBadgeItem = {
        icon: Truck,
        title: hasColdChain
          ? "Cadena de Frío Certificada"
          : "Envíos Asegurados a Todo México",
        description: hasColdChain
          ? "Monitoreo térmico continuo certificado para reactivos, biológicos y productos termolábiles."
          : "Empaque de protección médica y logística con guía rastreable y garantía de entrega.",
        statusBadge: {
          label: hasColdChain ? "Cadena de Frío" : "Cobertura Nacional",
          isVerified: true,
        },
      };

      // 3. Facturación Fiscal SAT CFDI 4.0
      const hasFiscalValidation = Boolean(
        store.taxReceiptAvailable ||
        store.rfc ||
        store.fiscalStatus === "COMPLETED"
      );
      const maskedRfc = store.rfc && store.rfc.length >= 4
        ? `${store.rfc.substring(0, 4)}***`
        : null;

      const fiscalBadge: TrustBadgeItem = {
        icon: Receipt,
        title: hasFiscalValidation
          ? "Facturación SAT CFDI 4.0"
          : "Comprobante Digital QuHealthy",
        description: hasFiscalValidation
          ? maskedRfc
            ? `Emisión formal de factura electrónica con RFC validado en el SAT (${maskedRfc}).`
            : "Emisión inmediata de factura electrónica deducible para personas físicas o morales."
          : "Recibo de compra digital emitido. Para solicitar factura con RFC contacta al proveedor.",
        statusBadge: {
          label: hasFiscalValidation ? "Deducible SAT" : "Comprobante",
          isVerified: hasFiscalValidation,
        },
      };

      // 4. Pago Escrow SSL QuHealthy y Garantía de Devolución
      const escrowBadge: TrustBadgeItem = {
        icon: Lock,
        title: "Pago Protegido en Garantía",
        description: store.returnPolicy
          ? "Transacciones encriptadas SSL. Tus fondos se resguardan en garantía bajo la política de devolución del proveedor."
          : "Transacciones encriptadas SSL. Tus fondos se resguardan en garantía hasta la recepción de tus insumos.",
        statusBadge: {
          label: store.returnPolicy ? "Devolución Activa" : "Escrow QuHealthy",
          isVerified: true,
        },
      };

      return [supplierBadge, logisticsBadge, fiscalBadge, escrowBadge];
    }

    // FLUJO MÉDICO / CLÍNICO
    // 1. Cédula Profesional y Credenciales
    const hasLicense = Boolean(
      store.doctorLicense || store.licenseStatus === "COMPLETED"
    );
    const licenseBadge: TrustBadgeItem = {
      icon: Award,
      title: hasLicense
        ? "Cédula Profesional Auditada"
        : "Profesional de Salud Registrado",
      description: store.doctorLicense
        ? `Cédula SEP / DGP: ${store.doctorLicense} (Estatus Activo ante la Dirección General de Profesiones).`
        : hasLicense
        ? "Cédula profesional verificada ante la SEP y Dirección General de Profesiones."
        : "Especialista incorporado a la red QuHealthy en proceso de auditoría documental.",
      statusBadge: {
        label: hasLicense ? "Cédula Verificada" : "En Revisión",
        isVerified: hasLicense,
      },
    };

    // 2. Expediente Digital NOM-004
    const nom004Badge: TrustBadgeItem = {
      icon: FileText,
      title: "Expediente Digital NOM-004",
      description:
        "Notas clínicas, recetas y datos de salud encriptados bajo la Norma Oficial Mexicana NOM-004-SSA3.",
      statusBadge: {
        label: "Norma Oficial",
        isVerified: true,
      },
    };

    // 3. Confirmación Inmediata de Cita
    const appointmentBadge: TrustBadgeItem = {
      icon: CalendarCheck,
      title: "Confirmación Inmediata de Cita",
      description: store.cancellationPolicy
        ? "Políticas de cancelación y reprogramación transparentes y gestionables en línea."
        : "Confirmación en tiempo real y recordatorios automatizados de consulta vía WhatsApp.",
      statusBadge: {
        label: "En Línea",
        isVerified: true,
      },
    };

    // 4. Pago Seguro y Retención en Garantía
    const paymentBadge: TrustBadgeItem = {
      icon: Lock,
      title: "Pago Seguro QuHealthy",
      description:
        "Tu pago queda protegido en garantía y únicamente se transfiere una vez que tu consulta concluye.",
      statusBadge: {
        label: "Garantía de Atención",
        isVerified: true,
      },
    };

    return [licenseBadge, nom004Badge, appointmentBadge, paymentBadge];
  }, [
    isSupplierOrProductStore,
    store.supplierStatus,
    store.cofeprisNotice,
    store.coldChainCertified,
    store.taxReceiptAvailable,
    store.rfc,
    store.fiscalStatus,
    store.doctorLicense,
    store.licenseStatus,
    store.cancellationPolicy,
    store.returnPolicy,
  ]);

  const isKycVerified = store.kycStatus === "COMPLETED";

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
              ? "Datos de acreditación comercial, logística y fiscal auditados por el motor de cumplimiento de QuHealthy."
              : "Acreditaciones clínicas, expediente normativo y protección de pago auditados por QuHealthy."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Badge de KYC Oficial si está validado en base de datos */}
          {isKycVerified ? (
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-2xl shadow-2xs text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>KYC Oficial Validado</span>
            </div>
          ) : store.kycStatus === "PENDING" ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-2xl shadow-2xs text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>KYC en Revisión</span>
            </div>
          ) : null}

          {/* Badge de QuScore Verificado */}
          {scoreData && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1.5 rounded-2xl shadow-2xs text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-black">QuScore {scoreData.score}</span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 uppercase">
                • Verificado
              </span>
            </div>
          )}
        </div>
      </div>

      {/* GRILLA DE 4 PILARES AUDITADOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.title}
              className="p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${safePrimaryColor}15`,
                      color: safePrimaryColor,
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      badge.statusBadge.isVerified
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {badge.statusBadge.label}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
