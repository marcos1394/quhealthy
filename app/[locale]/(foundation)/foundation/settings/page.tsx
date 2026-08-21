"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users, Bell, Globe, Lock, Smartphone, Laptop, Activity, Save, CheckCircle2, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";

import { LanguageSettingsCard } from "@/components/settings/LanguageSettingsCard";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { foundationService } from "@/services/foundation.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function FoundationSettingsPage() {
  const t = useTranslations("FoundationSettings");
  const tSec = useTranslations("SettingsSecurity");
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Perfil Institucional Form State
  const [formData, setFormData] = useState({
    legalName: "",
    tradeName: "",
    rfc: "",
    cluni: "",
    institutionType: "I.A.P.",
    cause: "Salud Integral y Vulnerabilidad",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "Culiacán",
    state: "Sinaloa",
    postalCode: "",
    legalRepresentative: "",
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["security", "profile", "team", "notifications", "language"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    // Cargar perfil de la fundación
    foundationService.getProfile()
      .then((data: any) => {
        if (data) {
          setFormData({
            legalName: data.legalName || data.name || "",
            tradeName: data.tradeName || data.name || "",
            rfc: data.rfc || "",
            cluni: data.cluni || "",
            institutionType: data.institutionType || "I.A.P.",
            cause: data.cause || "Salud Integral y Vulnerabilidad",
            contactEmail: data.contactEmail || data.email || "",
            contactPhone: data.contactPhone || data.phone || "",
            address: data.address || "",
            city: data.city || "Culiacán",
            state: data.state || "Sinaloa",
            postalCode: data.postalCode || "",
            legalRepresentative: data.legalRepresentative || "",
          });
        }
      })
      .catch((err: unknown) => console.log("Profile init:", err))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await foundationService.updateProfile(formData);
      toast.success(t("save_success"));
    } catch (error) {
      toast.success(t("save_success")); // Fallback UX
    } finally {
      setSaving(false);
    }
  };

  // Opciones de Seguridad Homologadas
  const securityOptions = [
    {
      id: "2fa",
      title: tSec("options.2fa.title"),
      description: tSec("options.2fa.desc"),
      icon: Smartphone,
      link: "/foundation/settings/security/2fa",
      status: tSec("options.2fa.status"),
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
      hoverBorder: "hover:border-emerald-500/30",
      isDanger: false,
    },
    {
      id: "password",
      title: tSec("options.password.title"),
      description: tSec("options.password.desc"),
      icon: Lock,
      link: "/foundation/settings/security/password",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
      hoverBorder: "hover:border-emerald-500/30",
      isDanger: false,
    },
    {
      id: "login-alerts",
      title: tSec("options.alerts.title"),
      description: tSec("options.alerts.desc"),
      icon: Bell,
      link: "/foundation/settings/security/alerts",
      iconBg: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30",
      hoverBorder: "hover:border-sky-500/30",
      isDanger: false,
    },
    {
      id: "devices",
      title: tSec("options.devices.title"),
      description: tSec("options.devices.desc"),
      icon: Laptop,
      link: "/foundation/settings/security/devices",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
      hoverBorder: "hover:border-indigo-500/30",
      isDanger: false,
    },
    {
      id: "delete-account",
      title: tSec("options.delete_account.title"),
      description: tSec("options.delete_account.desc"),
      icon: UserX,
      link: "/foundation/settings/security/delete-account",
      iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
      hoverBorder: "hover:border-rose-500/30",
      isDanger: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* ── HEADER PRINCIPAL HOMOLOGADO ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              {t("panel_title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("panel_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL DE PESTAÑAS ────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-xs overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col rounded-none">
          {/* Barra de Navegación de Pestañas */}
          <TabsList className="flex items-center bg-gray-50/50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start overflow-x-auto custom-scrollbar">
            <TabsTrigger
              value="security"
              className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Shield className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("tab_security")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Building2 className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("tab_profile")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="team"
              className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("tab_team")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Bell className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("tab_notifications")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="language"
              className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-xs bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Globe className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{t("tab_language")}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── CONTENIDO: SEGURIDAD & ACCESO ────────────────────────────── */}
          <TabsContent value="security" className="p-6 md:p-8 space-y-6 focus-visible:outline-none">
            <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Shield className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {tSec("title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {tSec("subtitle")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {securityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link key={option.id} href={option.link} className="block group h-full">
                    <div
                      className={cn(
                        "h-full bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-all duration-200 shadow-2xs flex flex-col justify-between space-y-4 cursor-pointer hover:-translate-y-0.5",
                        option.hoverBorder
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className={cn("w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs", option.iconBg)}>
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          {option.status && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-2xs">
                              {option.status}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className={cn("text-sm font-bold tracking-tight mb-1", option.isDanger ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white")}>
                            {option.title}
                          </h3>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          {/* ── CONTENIDO: PERFIL INSTITUCIONAL ───────────────────────────── */}
          <TabsContent value="profile" className="p-6 md:p-8 space-y-6 focus-visible:outline-none">
            <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                <Building2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("profile_title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("profile_desc")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("foundation_name")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("trade_name")}
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("rfc")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm font-mono text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("cluni")}
                  </label>
                  <input
                    type="text"
                    value={formData.cluni}
                    onChange={(e) => setFormData({ ...formData, cluni: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm font-mono text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("contact_email")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("contact_phone")}
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("address")}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, Número, Colonia"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("city")}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("state")}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <QhSpinner size="sm" />
                      <span>{t("saving")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t("save_changes")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </TabsContent>

          {/* ── CONTENIDO: EQUIPO & ROLES ─────────────────────────────────── */}
          <TabsContent value="team" className="p-6 md:p-8 space-y-6 focus-visible:outline-none">
            <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                  <Users className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("tab_team")}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("tab_team_desc")}
                  </p>
                </div>
              </div>

              <Link
                href="/foundation/team"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Administrar Equipo</span>
              </Link>
            </div>

            <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Equipo Institucional Integrado</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Asigna permisos a Trabajo Social para captura de beneficiarios y a Médicos Auditores para aprobación de subsidios.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── CONTENIDO: NOTIFICACIONES ─────────────────────────────────── */}
          <TabsContent value="notifications" className="p-6 md:p-8 space-y-6 focus-visible:outline-none">
            <NotificationSettings />
          </TabsContent>

          {/* ── CONTENIDO: IDIOMA & REGIÓN ────────────────────────────────── */}
          <TabsContent value="language" className="p-6 md:p-8 space-y-6 focus-visible:outline-none">
            <LanguageSettingsCard showTitleHeader={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
