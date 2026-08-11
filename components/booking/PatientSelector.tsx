"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { User, Users, Baby, Plus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useFamily } from "@/hooks/useFamily";
import { useBookingStore } from "@/hooks/useBookingStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/SessionStore";

export function PatientSelector() {
  const t = useTranslations("PatientCheckout");
  const router = useRouter();
  const { user } = useSessionStore();
  const { family, isLoading } = useFamily();
  const { dependentId, setDependentId, cart } = useBookingStore();

  // Por defecto, seleccionar al titular (null) si no se ha definido
  useEffect(() => {
    if (dependentId === undefined) {
      setDependentId(null);
    }
  }, [dependentId, setDependentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm gap-3">
        <QhSpinner size="md" className="text-store-600 dark:text-store-400" />
        <p className="text-xs font-semibold text-gray-400">{t("loading_family")}</p>
      </div>
    );
  }

  const safeColor = cart[0]?.providerColor || "#059669";

  const renderRelationshipText = (relationship: string) => {
    switch (relationship) {
      case "CHILD":
        return t("relationship_child");
      case "SPOUSE":
        return t("relationship_spouse");
      case "PARENT":
        return t("relationship_parent");
      default:
        return t("relationship_other");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header de la Sección */}
      <div className="flex items-center gap-3.5 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-2xl bg-store-50 dark:bg-store-950/30 border border-store-100 dark:border-store-900/30 flex items-center justify-center text-store-600 dark:text-store-400 shrink-0 shadow-xs">
          <Users className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("patient_assignment_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {t("patient_assignment_desc")}
          </p>
        </div>
      </div>

      {/* Grid de Pacientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Tarjeta del Titular (Yo) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setDependentId(null)}
          onKeyDown={(e) => e.key === "Enter" && setDependentId(null)}
          className={cn(
            "p-5 rounded-3xl border flex items-center gap-4 transition-all duration-300 cursor-pointer relative shadow-xs group",
            dependentId === null
              ? "bg-store-50/40 dark:bg-store-950/20 border-store-500 dark:border-store-500/80 ring-2 ring-store-500/20"
              : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
          )}
        >
          <div
            className={cn(
              "w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-colors shadow-xs",
              dependentId === null
                ? "bg-store-600 text-white border-store-600 dark:bg-store-500 dark:border-store-500"
                : "bg-store-50 dark:bg-store-950/30 border-store-100 dark:border-store-900/30 text-store-600 dark:text-store-400"
            )}
            style={
              dependentId === null && cart[0]?.providerColor
                ? { backgroundColor: safeColor, borderColor: safeColor }
                : undefined
            }
          >
            <User className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1 pr-6 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-store-600 dark:text-store-400">
              {t("patient_holder")}
            </p>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          {dependentId === null && (
            <CheckCircle2
              className="w-5 h-5 text-store-600 dark:text-store-400 absolute top-5 right-5"
              strokeWidth={2}
            />
          )}
        </div>

        {/* 2. Tarjetas de Familiares */}
        {family.map((member) => (
          <div
            key={member.id}
            role="button"
            tabIndex={0}
            onClick={() => setDependentId(member.id)}
            onKeyDown={(e) => e.key === "Enter" && setDependentId(member.id)}
            className={cn(
              "p-5 rounded-3xl border flex items-center gap-4 transition-all duration-300 cursor-pointer relative shadow-xs group",
              dependentId === member.id
                ? "bg-store-50/40 dark:bg-store-950/20 border-store-500 dark:border-store-500/80 ring-2 ring-store-500/20"
                : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
            )}
          >
            <div
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-colors shadow-xs",
                dependentId === member.id
                  ? "bg-store-600 text-white border-store-600 dark:bg-store-500 dark:border-store-500"
                  : "bg-store-50 dark:bg-store-950/30 border-store-100 dark:border-store-900/30 text-store-600 dark:text-store-400"
              )}
              style={
                dependentId === member.id && cart[0]?.providerColor
                  ? { backgroundColor: safeColor, borderColor: safeColor }
                  : undefined
              }
            >
              {member.relationship === "CHILD" ? (
                <Baby className="w-5 h-5" strokeWidth={2} />
              ) : (
                <User className="w-5 h-5" strokeWidth={2} />
              )}
            </div>

            <div className="min-w-0 flex-1 pr-6 space-y-0.5">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                {t("relationship_prefix")} {renderRelationshipText(member.relationship)}
              </p>
            </div>

            {dependentId === member.id && (
              <CheckCircle2
                className="w-5 h-5 text-store-600 dark:text-store-400 absolute top-5 right-5"
                strokeWidth={2}
              />
            )}
          </div>
        ))}
      </div>

      {/* 3. Botón para Añadir Dependiente */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/family")}
          className="h-11 px-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#050505] hover:border-store-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-store-600 dark:text-store-400" strokeWidth={2.5} />
          <span>{t("btn_add_dependent")}</span>
        </button>
      </div>
    </div>
  );
}