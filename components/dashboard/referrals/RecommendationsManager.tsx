"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Ticket,
  ArrowLeft,
  Percent,
  DollarSign,
  Settings2,
} from "lucide-react";

import { useRecommendationConfig } from "@/hooks/useRecommendationConfig";
import { RecommendationConfigDto } from "@/services/recommendationService";
import { RecommendationSettingsForm } from "./RecommendationSettingsForm";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export const RecommendationsManager = () => {
  const t = useTranslations("DashboardRecommendations.manager");
  const { campaigns, isLoading, refreshConfig } = useRecommendationConfig();

  const [view, setView] = useState<"list" | "form">("list");
  const [selectedCampaign, setSelectedCampaign] = useState<
    RecommendationConfigDto | undefined
  >(undefined);

  const handleCreateNew = () => {
    setSelectedCampaign(undefined);
    setView("form");
  };

  const handleEdit = (campaign: RecommendationConfigDto) => {
    setSelectedCampaign(campaign);
    setView("form");
  };

  const handleGoBack = () => {
    refreshConfig();
    setView("list");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 font-sans shadow-sm">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  // ── VISTA 1: FORMULARIO DE CAMPAÑA ───────────────────────────────────────
  if (view === "form") {
    return (
      <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden font-sans transition-colors">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>{t("back_to_list")}</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <RecommendationSettingsForm
            initialData={selectedCampaign}
            onSaved={handleGoBack}
          />
        </div>
      </div>
    );
  }

  // ── VISTA 2: LISTA DE CAMPAÑAS (DASHBOARD) ──────────────────────────────
  return (
    <div className="flex flex-col font-sans transition-colors space-y-6">
      {/* HEADER SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
            <Ticket className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("affiliate_program")}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
              {t("title")}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs shrink-0 w-full sm:w-auto cursor-pointer border-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_new_campaign")}</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <Ticket className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t("empty_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_create_first")}</span>
          </button>
        </div>
      ) : (
        /* GRID DE CAMPAÑAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign, index) => (
            <div
              key={campaign.id || index}
              className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all overflow-hidden group select-none"
            >
              <div className="p-5 sm:p-6 flex-1 space-y-4">
                {/* Header de Tarjeta */}
                <div className="flex justify-between items-center gap-2">
                  <span className="px-3 py-1 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-mono text-xs font-bold rounded-xl shadow-2xs">
                    {campaign.campaignCode}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs",
                      campaign.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                        : "border-gray-200 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    )}
                  >
                    {campaign.isActive ? t("status_active") : t("status_paused")}
                  </span>
                </div>

                {/* Propiedades y Metadatos */}
                <div className="space-y-2.5 bg-gray-50/60 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("patient_discount")}
                    </span>
                    <span className="font-bold font-mono text-xs text-gray-900 dark:text-white flex items-center">
                      {campaign.isDiscountPercentage ? (
                        <Percent
                          className="w-3.5 h-3.5 mr-0.5 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2}
                        />
                      ) : (
                        <DollarSign
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2}
                        />
                      )}
                      {campaign.discountAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("colleague_commission")}
                    </span>
                    <span className="font-bold font-mono text-xs text-gray-900 dark:text-white flex items-center">
                      {campaign.isCommissionPercentage ? (
                        <Percent
                          className="w-3.5 h-3.5 mr-0.5 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2}
                        />
                      ) : (
                        <DollarSign
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2}
                        />
                      )}
                      {campaign.commissionAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("catalog_scope")}
                    </span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {campaign.applyToAll
                        ? t("scope_global")
                        : t("scope_specific", {
                            count: campaign.applicableItemIds.length,
                          })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Acción Footer */}
              <button
                type="button"
                onClick={() => handleEdit(campaign)}
                className="w-full h-11 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 transition-colors text-xs font-bold flex items-center justify-center gap-2 mt-auto cursor-pointer"
              >
                <Settings2
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span>{t("btn_manage_campaign")}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};