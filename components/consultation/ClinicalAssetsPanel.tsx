"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTranslations } from "next-intl";
import {
  History,
  Pill,
  Video,
  FileCheck,
  ShieldAlert,
  ShoppingBag,
  Plus,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultDocument, PrescriptionItem } from "@/types/ehr";

interface ClinicalAssetsPanelProps {
  vaultDocuments: VaultDocument[];
  prescription: PrescriptionItem[];
  newRx: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  setNewRx: (rx: any) => void;
  handleAddRx: () => void;
  removePrescriptionItem: (id: string) => void;
  appointmentType: string;
  isOfflinePatient: boolean;
}

export const ClinicalAssetsPanel: React.FC<ClinicalAssetsPanelProps> = ({
  vaultDocuments,
  prescription,
  newRx,
  setNewRx,
  handleAddRx,
  removePrescriptionItem,
  appointmentType,
  isOfflinePatient,
}) => {
  const t = useTranslations("EHR");

  return (
    <section className="flex-1 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col min-w-0 border-r border-gray-100 dark:border-gray-800 z-0 font-sans transition-colors">
      <Tabs defaultValue="prescription" className="flex-1 flex flex-col h-full">
        {/* ── PESTAÑAS NAVEGACIÓN ────────────────────────────────────────── */}
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50/80 dark:bg-[#050505] p-1.5 h-auto rounded-2xl border border-gray-100 dark:border-gray-800 gap-1">
          <TabsTrigger
            value="vault"
            className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <History className="w-4 h-4" strokeWidth={2} />
            <span className="hidden md:inline">{t("tab_history")}</span>
          </TabsTrigger>

          <TabsTrigger
            value="prescription"
            className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Pill className="w-4 h-4" strokeWidth={2} />
            <span className="hidden md:inline">{t("tab_prescription")}</span>
          </TabsTrigger>

          {appointmentType === "video_call" ? (
            <TabsTrigger
              value="video"
              className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" strokeWidth={2} />
              <span className="hidden md:inline">{t("tab_video")}</span>
            </TabsTrigger>
          ) : (
            <div className="bg-transparent" />
          )}
        </TabsList>

        {/* ── TAB: BÓVEDA DE SALUD ───────────────────────────────────────── */}
        <TabsContent
          value="vault"
          className="flex-1 overflow-y-auto custom-scrollbar m-0 outline-none pr-1 space-y-4"
        >
          {isOfflinePatient ? (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <ShieldAlert className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {t("vault_offline_title")}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("vault_offline_desc")}
                </p>
              </div>
            </div>
          ) : vaultDocuments.length === 0 ? (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <History className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {t("vault_empty_title")}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("vault_empty_desc")}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {vaultDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 mr-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <FileCheck className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {doc.title || doc.fileName || t("untitled_note")}
                    </p>
                    {doc.documentType !== "NOTE" && (
                      <p className="text-[11px] font-medium font-mono text-gray-400">
                        {new Date(doc.uploadDate).toLocaleDateString()}{" "}
                        <span className="mx-1">•</span>{" "}
                        {(doc.fileSizeBytes || 0) > 0
                          ? (doc.fileSizeBytes! / 1024 / 1024).toFixed(1) + " MB"
                          : "0 MB"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAB: RECETA DIGITAL ────────────────────────────────────────── */}
        <TabsContent
          value="prescription"
          className="flex-1 overflow-y-auto custom-scrollbar m-0 space-y-6 outline-none pr-1"
        >
          {/* Formulario de Emisión */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <Pill className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                  {t("rx_title")}
                </h3>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("btn_link_product")}</span>
              </button>
            </div>

            {/* Inputs del Medicamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder={t("rx_medication")}
                value={newRx.medicationName}
                onChange={(e) => setNewRx({ ...newRx, medicationName: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
              <Input
                placeholder={t("rx_dosage")}
                value={newRx.dosage}
                onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder={t("rx_frequency")}
                value={newRx.frequency}
                onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
              <Input
                placeholder={t("rx_duration")}
                value={newRx.duration}
                onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
              <Input
                placeholder={t("rx_instructions")}
                value={newRx.instructions}
                onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleAddRx}
              disabled={!newRx.medicationName || !newRx.dosage}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>{t("rx_add_item")}</span>
            </button>
          </div>

          {/* Lista de Medicamentos Agregados */}
          <div className="space-y-3">
            {prescription.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2 truncate">
                    <span>{item.medicationName}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                      {item.dosage}
                    </span>
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
                    {t("rx_take_prefix", {
                      frequency: item.frequency,
                      duration: item.duration,
                    })}
                  </p>
                  {item.instructions && (
                    <p className="text-[11px] font-normal text-gray-400 italic">
                      {t("instructions_prefix", {
                        instructions: item.instructions,
                      })}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removePrescriptionItem(item.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB: VIDEOLLAMADA ───────────────────────────────────────────── */}
        {appointmentType === "video_call" && (
          <TabsContent value="video" className="flex-1 m-0 outline-none">
            <div className="h-full min-h-[380px] rounded-3xl bg-gray-900 dark:bg-[#050505] border border-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-3 shadow-inner">
              <div className="w-16 h-16 rounded-3xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-emerald-400 shadow-xs">
                <Video className="w-8 h-8" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-white">
                  {t("video_room_title")}
                </p>
                <p className="text-xs font-medium text-gray-400 max-w-xs">
                  {t("video_room_desc")}
                </p>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
};