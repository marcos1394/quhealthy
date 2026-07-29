"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  Wrench,
  FileText,
  Calendar,
  Edit3,
  Trash2,
  BotMessageSquare,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BiomedicalEquipmentDTO } from "@/types/biomedical";
import { biomedicalService } from "@/services/biomedical.service";
import { useSessionStore } from "@/stores/SessionStore";

import { CreateWorkOrderDrawer } from "../CreateWorkOrderDrawer";
import { CreateWarrantyDrawer } from "../CreateWarrantyDrawer";
import { CreateScheduleDrawer } from "../CreateScheduleDrawer";

// Componente para ver el estado de procesamiento del PDF con i18n
function DocumentProcessingBadge({
  documentId,
  type,
}: {
  documentId: string;
  type: string;
}) {
  const t = useTranslations("BiomedicalEquipmentDetail");
  const [status, setStatus] = useState<string>("UNKNOWN");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (type !== "MANUAL" && type !== "MAINTENANCE_GUIDE") return;

    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const res = await biomedicalService.getDocumentProcessingStatus(
          documentId
        );
        setStatus(res.status);
        if (res.totalChunks > 0) {
          setProgress(
            Math.round((res.processedChunks / res.totalChunks) * 100)
          );
        }
        if (res.status === "COMPLETED" || res.status === "FAILED") {
          clearInterval(interval);
        }
      } catch {
        // Ignorar si no se encuentra
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [documentId, type]);

  if (type !== "MANUAL" && type !== "MAINTENANCE_GUIDE") return null;

  if (status === "COMPLETED") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
        {t("ai_ready")}
      </span>
    );
  }
  if (status === "PROCESSING" || status === "STARTED") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 animate-pulse">
        {t("ai_processing", { progress })}
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
        {t("ai_error")}
      </span>
    );
  }
  return null;
}

export default function EquipmentDetailPage() {
  const t = useTranslations("BiomedicalEquipmentDetail");
  const params = useParams();
  const router = useRouter();
  const equipmentId = params?.id as string;

  const { user } = useSessionStore();
  const providerId = user?.id?.toString();

  const [equipment, setEquipment] = useState<BiomedicalEquipmentDTO | null>(
    null
  );
  const [mttr, setMttr] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Estados de Drawers
  const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);
  const [isWarrantyDrawerOpen, setIsWarrantyDrawerOpen] = useState(false);
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);

  // Estados de Datos
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  // Estado del Chat IA
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      if (!equipmentId || !providerId) return;
      setIsLoading(true);
      try {
        const mttrValue = await biomedicalService
          .getMTTR(equipmentId)
          .catch(() => null);
        if (mttrValue !== null) setMttr(mttrValue);

        const equipments = await biomedicalService.listEquipments(providerId);
        const found = equipments.find(
          (eq: BiomedicalEquipmentDTO) => eq.id === equipmentId
        );
        if (found) {
          setEquipment(found);
        } else {
          toast.error(t("toast_not_found"));
        }
      } catch (err) {
        console.error(err);
        toast.error(t("toast_load_error"));
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDocsAndWarranties = async () => {
      if (!equipmentId) return;
      try {
        const docs = await biomedicalService.getDocuments(equipmentId);
        setDocuments(docs);
        const warrs = await biomedicalService.getWarranties(equipmentId);
        setWarranties(warrs);
        const scheds = await biomedicalService.getSchedules(equipmentId);
        setSchedules(scheds);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchWorkOrders = async () => {
      if (!equipmentId) return;
      try {
        const orders = await biomedicalService.getWorkOrders(equipmentId);
        setWorkOrders(orders);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEquipmentDetails();
    fetchDocsAndWarranties();
    fetchWorkOrders();
  }, [equipmentId, providerId, t]);

  const refreshWorkOrders = async () => {
    try {
      const orders = await biomedicalService.getWorkOrders(equipmentId);
      setWorkOrders(orders);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshWarranties = async () => {
    try {
      const warrs = await biomedicalService.getWarranties(equipmentId);
      setWarranties(warrs);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshSchedules = async () => {
    try {
      const scheds = await biomedicalService.getSchedules(equipmentId);
      setSchedules(scheds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !equipmentId) return;

    setIsUploading(true);
    try {
      const { signedUrl, publicUrl } = await biomedicalService.getUploadUrl(
        equipmentId,
        file.name,
        file.type
      );

      await axios.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      await biomedicalService.registerDocument(
        equipmentId,
        "MANUAL",
        publicUrl
      );
      toast.success(t("toast_upload_success"));

      const docs = await biomedicalService.getDocuments(equipmentId);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      toast.error(t("toast_upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !equipmentId) return;

    const question = currentMessage.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setCurrentMessage("");
    setIsChatLoading(true);

    try {
      const res = await biomedicalService.askAssistant(equipmentId, question);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer },
      ]);
    } catch (error) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chat_error") },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <ShieldAlert className="w-8 h-8" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("not_found_title")}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {t("not_found_desc")}
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0"
        >
          {t("btn_back_inventory")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-12 h-12 p-0 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 shadow-sm shrink-0 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </Button>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400 shadow-sm">
                  {t("spec_sheet", {
                    category: equipment.categoryName || "S/N",
                  })}
                </span>
                {equipment.status === "AVAILABLE" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 shadow-sm">
                    {t("status_available")}
                  </span>
                )}
                {equipment.status === "ACTIVE" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
                    {t("status_active")}
                  </span>
                )}
                {equipment.status === "OUT_OF_SERVICE" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shadow-sm">
                    {t("status_out_of_service")}
                  </span>
                )}
                {equipment.status === "IN_MAINTENANCE" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-sm">
                    {t("status_in_maintenance")}
                  </span>
                )}
                {equipment.status === "DECOMMISSIONED" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                    {t("status_decommissioned")}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {equipment.name}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">
                {t("serial_number", { serial: equipment.serialNumber })}{" "}
                {equipment.internalCode &&
                  ` | ${t("internal_id", { code: equipment.internalCode })}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all h-11 px-5 shadow-sm flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_edit")}</span>
            </Button>
            <Button
              onClick={() => setIsWorkOrderDrawerOpen(true)}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_new_order")}</span>
            </Button>
          </div>
        </div>

        {/* ── TABS NAVEGACIÓN ──────────────────────────────────────────── */}
        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="w-full justify-start h-auto p-1.5 bg-gray-100/70 dark:bg-gray-800/40 rounded-2xl flex-wrap shadow-sm">
            <TabsTrigger
              value="general"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_general")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_orders")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_schedule")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_documents")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="warranties"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_warranties")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai-chat"
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <BotMessageSquare className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_ai_assistant")}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: INFORMACIÓN GENERAL ───────────────────────────── */}
          <TabsContent value="general" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Tarjeta Detalle Fabricante y Ciclo de Vida */}
              <div className="lg:col-span-2 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                    {t("general.manufacturer_details")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.manufacturer")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.manufacturer}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.model")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.model}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.category")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.categoryName || "S/N"}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.risk_level")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.riskLevel === "LOW" && t("general.risk_low")}
                        {equipment.riskLevel === "MEDIUM" && t("general.risk_medium")}
                        {equipment.riskLevel === "HIGH" && t("general.risk_high")}
                        {!equipment.riskLevel && "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                    {t("general.life_cycle")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.acquisition_date")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.acquisitionDate || t("general.not_registered")}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("general.useful_life")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {equipment.usefulLifeYears
                          ? t("general.useful_life_years", {
                              years: equipment.usefulLifeYears,
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta Métricas y KPIs */}
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                  {t("general.metrics")}
                </h3>
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
                      {t("general.mttr")}
                    </p>
                    <p className="text-3xl font-bold tracking-tight font-mono text-emerald-900 dark:text-emerald-300">
                      {mttr !== null ? Math.round(mttr) : "--"}{" "}
                      <span className="text-xs font-medium opacity-75">
                        {t("general.minutes_abbr")}
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {t("general.total_corrective")}
                    </p>
                    <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                      {workOrders.filter((wo) => wo.type === "CORRECTIVE").length}
                    </p>
                  </div>

                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {t("general.last_maintenance")}
                    </p>
                    <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                      --/--/----
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* ── TAB 2: ÓRDENES DE TRABAJO ────────────────────────────────── */}
          <TabsContent value="orders" className="m-0 focus-visible:outline-none">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("orders.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("orders.subtitle")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsWorkOrderDrawerOpen(true)}
                  className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("orders.btn_create")}</span>
                </Button>
              </div>

              {workOrders.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <Wrench className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {t("orders.empty_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("orders.empty_desc")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("orders.th_type")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("orders.th_priority")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("orders.th_status")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("orders.th_date")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                          {t("orders.th_action")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {workOrders.map((wo: any) => (
                        <tr
                          key={wo.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                        >
                          <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white capitalize">
                            {wo.type === "CORRECTIVE"
                              ? t("orders.type_corrective")
                              : wo.type === "PREVENTIVE"
                              ? t("orders.type_preventive")
                              : wo.type.toLowerCase()}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                wo.priority === "CRITICAL"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                                  : wo.priority === "HIGH"
                                  ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40"
                                  : wo.priority === "NORMAL"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40"
                                  : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                              )}
                            >
                              {wo.priority}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                wo.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                                  : wo.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                                  : wo.status === "CANCELLED"
                                  ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                  : "bg-white text-gray-700 border-gray-200 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800"
                              )}
                            >
                              {wo.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                            {wo.scheduledDate
                              ? new Date(wo.scheduledDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="ghost"
                              className="h-8 px-3 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                              {t("orders.btn_view")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 3: PROGRAMACIÓN ──────────────────────────────────────── */}
          <TabsContent value="schedule" className="m-0 focus-visible:outline-none">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("schedule.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("schedule.subtitle")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleDrawerOpen(true)}
                  className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("schedule.btn_schedule")}</span>
                </Button>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <Calendar className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {t("schedule.empty_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("schedule.empty_desc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((sched: any) => (
                    <div
                      key={sched.id}
                      className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                          {sched.periodicity === "CUSTOM"
                            ? t("schedule.every_days", {
                                days: sched.customDays,
                              })
                            : sched.periodicity.toLowerCase()}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            sched.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                          )}
                        >
                          {sched.isActive
                            ? t("schedule.status_active")
                            : t("schedule.status_inactive")}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                          <span>
                            {t("schedule.next_date", {
                              date: sched.nextMaintenanceDate
                                ? new Date(sched.nextMaintenanceDate).toLocaleDateString()
                                : "N/A",
                            })}
                          </span>
                        </div>
                        {sched.lastMaintenanceDate && (
                          <div className="flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400 opacity-80">
                            <CheckCircle className="w-4 h-4" strokeWidth={2} />
                            <span>
                              {t("schedule.last_date", {
                                date: new Date(sched.lastMaintenanceDate).toLocaleDateString(),
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 4: DOCUMENTOS ────────────────────────────────────────── */}
          <TabsContent value="documents" className="m-0 focus-visible:outline-none">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("documents.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("documents.subtitle")}
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      asChild
                      variant="outline"
                      disabled={isUploading}
                      className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        {isUploading ? t("documents.btn_uploading") : t("documents.btn_upload")}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <FileText className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {t("documents.empty_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("documents.empty_desc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex justify-between items-center group hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                          <FileText
                            className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            {doc.type} - v{doc.version}
                          </a>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-gray-400">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                            <DocumentProcessingBadge
                              documentId={doc.id}
                              type={doc.type}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-8 h-8 p-0 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 5: GARANTÍAS ────────────────────────────────────────── */}
          <TabsContent value="warranties" className="m-0 focus-visible:outline-none">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("warranties.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("warranties.subtitle")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsWarrantyDrawerOpen(true)}
                  className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("warranties.btn_register")}</span>
                </Button>
              </div>

              {warranties.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <ShieldAlert className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {t("warranties.empty_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("warranties.empty_desc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {warranties.map((war: any) => (
                    <div
                      key={war.id}
                      className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {war.providerName}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            war.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                          )}
                        >
                          {war.isActive
                            ? t("warranties.status_valid")
                            : t("warranties.status_expired")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>
                            {new Date(war.startDate).toLocaleDateString()} -{" "}
                            {new Date(war.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {war.coverageDetails}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 6: ASISTENTE IA ──────────────────────────────────────── */}
          <TabsContent value="ai-chat" className="m-0 focus-visible:outline-none">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[550px] flex flex-col shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-gray-50/50 dark:bg-[#050505]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <BotMessageSquare className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("ai_chat.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("ai_chat.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[450px]">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-sm">
                      <BotMessageSquare className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {t("ai_chat.prompt_title")}
                    </p>
                    <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                      {t("ai_chat.prompt_desc")}
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex w-full",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 text-xs font-medium leading-relaxed shadow-sm",
                          msg.role === "user"
                            ? "bg-emerald-600 text-white rounded-2xl rounded-tr-none"
                            : "bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 dark:bg-[#050505] p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex items-center gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={t("ai_chat.placeholder")}
                    className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm placeholder:text-gray-400"
                    disabled={isChatLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isChatLoading || !currentMessage.trim()}
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold h-11 px-6 border-0 shadow-sm shrink-0"
                  >
                    {t("ai_chat.btn_send")}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>

      {/* ── DRAWERS ────────────────────────────────────────────────────── */}
      <CreateWorkOrderDrawer
        isOpen={isWorkOrderDrawerOpen}
        onClose={() => setIsWorkOrderDrawerOpen(false)}
        onSuccess={refreshWorkOrders}
        equipmentId={equipment.id}
      />
      <CreateWarrantyDrawer
        isOpen={isWarrantyDrawerOpen}
        onClose={() => setIsWarrantyDrawerOpen(false)}
        onSuccess={refreshWarranties}
        equipmentId={equipment.id}
      />
      <CreateScheduleDrawer
        isOpen={isScheduleDrawerOpen}
        onClose={() => setIsScheduleDrawerOpen(false)}
        onSuccess={refreshSchedules}
        equipmentId={equipment.id}
      />
    </div>
  );
}