"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  FileText,
  Globe,
  User,
  Star,
  Trash2,
  Settings,
  Edit2,
  Save,
  PlusCircle,
  Heart,
  ArrowLeft,
  X,
  Link2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  clinicalTemplateService,
  ClinicalTemplateResponse,
  ClinicalTemplateRequest,
  ClinicalTemplateField,
} from "@/services/clinicalTemplates.service";
import { catalogService } from "@/services/catalog.service";
import { CatalogItemDTO } from "@/types/catalog";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TemplatesExplorerPage() {
  const t = useTranslations("Templates");
  const [activeTab, setActiveTab] = useState<"personal" | "community">("personal");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSessionStore();
  const providerId = user?.id;

  const [personalTemplates, setPersonalTemplates] = useState<
    ClinicalTemplateResponse[]
  >([]);
  const [communityTemplates, setCommunityTemplates] = useState<
    ClinicalTemplateResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [previewTemplate, setPreviewTemplate] =
    useState<ClinicalTemplateResponse | null>(null);

  const [linkServiceModalOpen, setLinkServiceModalOpen] = useState(false);
  const [templateToLink, setTemplateToLink] =
    useState<ClinicalTemplateResponse | null>(null);
  const [providerServices, setProviderServices] = useState<CatalogItemDTO[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<ClinicalTemplateRequest>({
    name: "",
    description: "",
    type: "CUSTOM",
    category: "General",
    schema: { fields: [] },
  });

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      if (providerId) {
        const personal = await clinicalTemplateService.getTemplates(providerId);
        setPersonalTemplates(personal.filter((tmpl) => !tmpl.isPublic));
      }

      const community =
        await clinicalTemplateService.getCommunityTemplates();
      setCommunityTemplates(community);
    } catch (error) {
      handleApiError(error, t("error_loading"));
    } finally {
      setIsLoading(false);
    }
  }, [providerId, t]);

  useEffect(() => {
    if (providerId) {
      loadTemplates();
    }
  }, [providerId, loadTemplates]);

  const handleNewTemplate = () => {
    setCurrentTemplate({
      name: "",
      description: "",
      type: "CUSTOM",
      category: "General",
      providerId: providerId,
      schema: { fields: [] },
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleEditTemplate = (tmpl: ClinicalTemplateResponse) => {
    setCurrentTemplate({
      name: tmpl.name,
      description: tmpl.description,
      type: tmpl.type,
      category: tmpl.category,
      providerId: tmpl.providerId,
      schema: tmpl.schema || { fields: [] },
      pdfTemplateText: tmpl.pdfTemplateText,
    });
    setEditingId(tmpl.id);
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm(t("toasts.delete_confirm"))) {
      try {
        await clinicalTemplateService.deleteTemplate(id);
        toast.success(t("toasts.delete_success"), { theme: "colored" });
        loadTemplates();
      } catch (error) {
        handleApiError(error, t("toasts.delete_error"));
      }
    }
  };

  const saveTemplate = async () => {
    if (!currentTemplate.name.trim()) {
      toast.error(t("toasts.save_name_required"));
      return;
    }

    try {
      if (editingId) {
        await clinicalTemplateService.updateTemplate(editingId, currentTemplate);
        toast.success(t("toasts.save_success_updated"), { theme: "colored" });
      } else {
        await clinicalTemplateService.createTemplate(currentTemplate);
        toast.success(t("toasts.save_success_created"), { theme: "colored" });
      }
      setIsEditing(false);
      loadTemplates();
    } catch (error) {
      handleApiError(error, t("toasts.save_error"));
    }
  };

  const addField = () => {
    const newField: ClinicalTemplateField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "Nuevo Campo",
      required: false,
    };
    setCurrentTemplate((prev) => ({
      ...prev,
      schema: {
        fields: [...(prev.schema?.fields || []), newField],
      },
    }));
  };

  const updateField = (
    index: number,
    updates: Partial<ClinicalTemplateField>
  ) => {
    setCurrentTemplate((prev) => {
      const fields = [...(prev.schema?.fields || [])];
      fields[index] = { ...fields[index], ...updates };
      return { ...prev, schema: { fields } };
    });
  };

  const removeField = (index: number) => {
    setCurrentTemplate((prev) => {
      const fields = [...(prev.schema?.fields || [])];
      fields.splice(index, 1);
      return { ...prev, schema: { fields } };
    });
  };

  const handleLike = async (id: number) => {
    try {
      await clinicalTemplateService.likeTemplate(id);
      toast.success(t("toasts.like_success"));
      loadTemplates();
    } catch (err) {
      handleApiError(err, t("toasts.like_error"));
    }
  };

  const handleClone = async (tmpl: ClinicalTemplateResponse) => {
    if (!providerId) return;
    try {
      await clinicalTemplateService.cloneTemplate(tmpl.id, providerId);
      toast.success(t("toasts.clone_success"), { theme: "colored" });
      loadTemplates();
      setActiveTab("personal");
    } catch (err) {
      handleApiError(err, t("toasts.clone_error"));
    }
  };

  const handleOpenLinkModal = async (tmpl: ClinicalTemplateResponse) => {
    setTemplateToLink(tmpl);
    setLinkServiceModalOpen(true);
    try {
      const services = await catalogService.getMyCatalog();
      setProviderServices(services.filter((s) => s.type === "SERVICE"));
    } catch (err) {
      toast.error(t("toasts.services_error"));
    }
  };

  const handleLinkService = async () => {
    if (!selectedServiceId || !templateToLink) return;
    try {
      const service = providerServices.find(
        (s) => s.id === Number(selectedServiceId)
      );
      if (service && service.id) {
        if (!service.metadata) service.metadata = {};
        service.metadata.clinicalTemplateId = templateToLink.id;

        await catalogService.updateItem(service.id, service);
        toast.success(
          t("toasts.link_success", { service: service.name }),
          { theme: "colored" }
        );
        setLinkServiceModalOpen(false);
      }
    } catch (err) {
      handleApiError(err, t("toasts.link_error"));
    }
  };

  // =========================================================================
  // VISTA 1: CONSTRUCTOR DE FORMULARIO (MODO EDICIÓN/CREACIÓN)
  // =========================================================================
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Constructor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
              </Button>
              <div>
                <p className="text-xs font-bold text-gray-400">
                  {t("builder.subtitle")}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {editingId ? t("builder.title_edit") : t("builder.title_new")}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-11 px-5 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                onClick={saveTemplate}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-sm border-0 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("actions.save")}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel Izquierdo: Configuración Base */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {t("builder.config_title")}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("builder.name_label")}
                    </label>
                    <input
                      type="text"
                      className="w-full h-11 px-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      value={currentTemplate.name}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, name: e.target.value })
                      }
                      placeholder={t("builder.name_placeholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("builder.category_label")}
                    </label>
                    <input
                      type="text"
                      className="w-full h-11 px-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      value={currentTemplate.category}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, category: e.target.value })
                      }
                      placeholder={t("builder.category_placeholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("builder.description_label")}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm resize-y"
                      value={currentTemplate.description}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, description: e.target.value })
                      }
                      placeholder={t("builder.description_placeholder")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Form Builder */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm min-h-[500px] flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {t("builder.fields_title")}
                      </h3>
                    </div>

                    <Button
                      variant="outline"
                      onClick={addField}
                      className="h-9 px-4 rounded-xl border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" strokeWidth={2} />
                      <span>{t("builder.add_field")}</span>
                    </Button>
                  </div>

                  <div className="space-y-3.5">
                    {currentTemplate.schema?.fields?.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-xs font-semibold border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8">
                        {t("builder.empty_fields")}
                      </div>
                    )}

                    {currentTemplate.schema?.fields?.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl relative group shadow-sm space-y-3"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(index)}
                          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </Button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {t("builder.label_placeholder")}
                            </label>
                            <input
                              type="text"
                              className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                              value={field.label}
                              onChange={(e) =>
                                updateField(index, { label: e.target.value })
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {t("builder.field_type")}
                            </label>
                            <Select
                              value={field.type}
                              onValueChange={(val: any) =>
                                updateField(index, { type: val })
                              }
                            >
                              <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                                <SelectItem value="text" className="text-xs font-semibold">
                                  {t("builder.types.text")}
                                </SelectItem>
                                <SelectItem value="textarea" className="text-xs font-semibold">
                                  {t("builder.types.textarea")}
                                </SelectItem>
                                <SelectItem value="number" className="text-xs font-semibold">
                                  {t("builder.types.number")}
                                </SelectItem>
                                <SelectItem value="date" className="text-xs font-semibold">
                                  {t("builder.types.date")}
                                </SelectItem>
                                <SelectItem value="select" className="text-xs font-semibold">
                                  {t("builder.types.select")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {field.type === "select" && (
                          <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {t("builder.options_label")}
                            </label>
                            <input
                              type="text"
                              className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                              value={field.options?.join(", ") || ""}
                              onChange={(e) => {
                                const opts = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                updateField(index, { options: opts });
                              }}
                              placeholder={t("builder.options_placeholder")}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: EXPLORADOR Y BIBLIOTECA (MODO LISTA / GRID)
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <Button
            onClick={handleNewTemplate}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("new_template")}</span>
          </Button>
        </div>

        {/* Buscador y Control de Pestañas */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="w-full h-11 pl-11 pr-4 bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={cn(
                "h-9 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all",
                activeTab === "personal"
                  ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <User className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{t("tabs.personal")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("community")}
              className={cn(
                "h-9 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all",
                activeTab === "community"
                  ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{t("tabs.community")}</span>
            </button>
          </div>
        </div>

        {/* Grid de Contenido */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <QhSpinner size="lg" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "personal" ? (
              // Plantillas Personales
              personalTemplates
                .filter((tmpl) =>
                  tmpl.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((tmpl) => (
                  <motion.div
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-flex items-center px-3 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-sm">
                          {tmpl.category || "General"}
                        </span>
                        {tmpl.type === "SYSTEM" && (
                          <span className="inline-flex items-center px-3 py-0.5 text-[10px] font-bold rounded-full border border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800 shadow-sm">
                            {t("system_badge")}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tmpl.name}
                      </h3>

                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {tmpl.description || t("no_description")}
                      </p>

                      <div className="text-[10px] font-mono font-bold text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {t("fields_count", {
                          count: tmpl.schema?.fields?.length || 0,
                        })}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      {tmpl.type !== "SYSTEM" ? (
                        <div className="flex items-center w-full gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleOpenLinkModal(tmpl)}
                            className="flex-1 h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                            <span className="truncate">{t("actions.link_service")}</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTemplate(tmpl)}
                            className="w-9 h-9 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm shrink-0"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" strokeWidth={2} />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTemplate(tmpl.id)}
                            className="w-9 h-9 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setPreviewTemplate(tmpl)}
                          className="w-full h-9 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                        >
                          {t("actions.detail")}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
            ) : (
              // Plantillas de Comunidad
              communityTemplates
                .filter((tmpl) =>
                  tmpl.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((tmpl) => (
                  <motion.div
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-flex items-center px-3 py-0.5 text-[10px] font-bold rounded-full border border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40 shadow-sm">
                          {tmpl.category || tmpl.type}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleLike(tmpl.id)}
                            className="flex items-center gap-1 text-rose-500 hover:scale-105 transition-transform"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                            <span className="text-xs font-mono font-bold">
                              {tmpl.likes || 0}
                            </span>
                          </button>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                            <span className="text-xs font-mono font-bold">
                              {tmpl.rating?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tmpl.name}
                      </h3>

                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {tmpl.description || t("no_community_description")}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] font-medium text-gray-400">
                        <span className="flex items-center gap-1 font-bold">
                          <User className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>
                            {tmpl.authorName ||
                              (tmpl.type === "SYSTEM"
                                ? "QuHealthy"
                                : "Anónimo")}
                          </span>
                        </span>
                        <span className="font-mono">
                          {t("fields_count", {
                            count: tmpl.schema?.fields?.length || 0,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewTemplate(tmpl)}
                        className="w-1/3 h-9 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                      >
                        {t("actions.detail")}
                      </Button>
                      <Button
                        onClick={() => handleClone(tmpl)}
                        className="w-2/3 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 border-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{t("actions.use_template")}</span>
                      </Button>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        )}

        {/* ── MODAL VISTA PREVIA ─────────────────────────────────────────── */}
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
        >
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {previewTemplate?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-gray-500">
                    {previewTemplate?.description || t("preview.subtitle")}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
              {previewTemplate?.schema?.fields?.map((field) => (
                <div
                  key={field.id}
                  className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-1.5"
                >
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {field.label}{" "}
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      disabled
                      className="w-full h-16 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-400 resize-none"
                    />
                  ) : field.type === "select" ? (
                    <div className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 flex items-center text-xs text-gray-400">
                      {t("preview.select_placeholder")}
                    </div>
                  ) : (
                    <input
                      disabled
                      type={field.type}
                      className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-xs text-gray-400"
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL VINCULACIÓN A SERVICIO ───────────────────────────────── */}
        <Dialog
          open={linkServiceModalOpen}
          onOpenChange={setLinkServiceModalOpen}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Link2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {t("link_modal.title")}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-gray-500">
                    {t("link_modal.subtitle")}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLinkServiceModalOpen(false)}
                className="w-8 h-8 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>

            <div className="p-6 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("link_modal.label")}
                </label>
                <Select
                  value={selectedServiceId.toString()}
                  onValueChange={(val: any) =>
                    setSelectedServiceId(Number(val))
                  }
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                    <SelectValue placeholder={t("link_modal.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                    {providerServices.map((s) =>
                      s.id ? (
                        <SelectItem
                          key={s.id}
                          value={s.id.toString()}
                          className="text-xs font-semibold"
                        >
                          {s.name}
                        </SelectItem>
                      ) : null
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setLinkServiceModalOpen(false)}
                className="h-10 px-5 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                onClick={handleLinkService}
                disabled={!selectedServiceId}
                className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm border-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span>{t("link_modal.confirm_btn")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}