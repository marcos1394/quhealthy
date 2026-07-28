"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Bell,
  Database,
  Watch,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { WearablesSettings } from "@/components/settings/WearablesSettings";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const t = useTranslations("PatientSettings");
  const [activeTab, setActiveTab] = useState("security");
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await consumerProfileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentChange = async (accepted: boolean) => {
    if (!profile) return false;
    try {
      const updated = await consumerProfileService.updateProfile({
        ...profile,
        algorithmicConsentAccepted: accepted,
      });
      setProfile(updated);
      toast.success(
        accepted ? t("toast_consent_granted") : t("toast_consent_revoked")
      );
      return true;
    } catch (error) {
      console.error("Error updating consent:", error);
      toast.error(t("toast_consent_error"));
      return false;
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
            <SettingsIcon className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── SELECTOR DE PESTAÑAS ──────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 gap-2 no-scrollbar pb-1 bg-transparent justify-start h-auto p-0 rounded-none w-full">
            <TabsTrigger
              value="security"
              className={cn(
                "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
                "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
                "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
              )}
            >
              <Shield className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_security")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              className={cn(
                "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
                "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
                "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
              )}
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_notifications")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="privacy"
              className={cn(
                "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
                "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
                "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
              )}
            >
              <Database className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_privacy")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="wearables"
              className={cn(
                "px-5 h-11 text-xs font-bold transition-all whitespace-nowrap rounded-xl border flex items-center gap-2",
                "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm",
                "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a]"
              )}
            >
              <Watch className="w-4 h-4" strokeWidth={2} />
              <span>{t("tab_wearables")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="security"
            className="mt-0 focus-visible:ring-0 outline-none"
          >
            <SecuritySettings />
          </TabsContent>

          <TabsContent
            value="notifications"
            className="mt-0 focus-visible:ring-0 outline-none"
          >
            <NotificationSettings />
          </TabsContent>

          <TabsContent
            value="privacy"
            className="mt-0 focus-visible:ring-0 outline-none"
          >
            <PrivacySettings
              algorithmicConsent={
                profile?.algorithmicConsentAccepted ?? false
              }
              onConsentChange={handleConsentChange}
            />
          </TabsContent>

          <TabsContent
            value="wearables"
            className="mt-0 focus-visible:ring-0 outline-none"
          >
            <WearablesSettings />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}