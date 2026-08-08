"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Trash2,
  ShieldAlert,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function SharedDevicesManager() {
  const t = useTranslations("SettingsSecurity");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error(error);
      toast.error(t("devices.error_loading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      await securityService.revokeSession(sessionId);
      toast.success(t("devices.success_revoke"));
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (error) {
      console.error(error);
      toast.error(t("devices.error_revoke"));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      setRevokingAll(true);
      await securityService.revokeAllExceptCurrent();
      toast.success(t("devices.success_revoke_all"));
      await fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error(t("devices.error_revoke_all"));
    } finally {
      setRevokingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-transparent gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("devices.loading")}
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            {t("devices.title")}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("devices.subtitle")}
          </CardDescription>
        </div>

        {sessions.length > 1 && (
          <Button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            variant="outline"
            className="h-9 px-4 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold shadow-sm shrink-0 flex items-center gap-1.5"
          >
            {revokingAll ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("devices.revoke_others_btn")}</span>
              </>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
              <Laptop className="w-7 h-7" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
              {t("devices.empty")}
            </p>
          </div>
        ) : (
          sessions.map((session, index) => {
            const isMobile =
              session.deviceName?.toLowerCase().includes("mobile") ||
              session.deviceName?.toLowerCase().includes("iphone") ||
              session.deviceName?.toLowerCase().includes("android");

            return (
              <motion.div
                key={session.sessionId || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all shadow-sm gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    {isMobile ? (
                      <Smartphone className="w-5 h-5" strokeWidth={2} />
                    ) : (
                      <Laptop className="w-5 h-5" strokeWidth={2} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        {session.deviceName || t("devices.unknown_device")}
                      </span>

                      {session.current && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm">
                          {t("devices.current_badge")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-mono text-[11px] font-bold">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        {session.ipAddress}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {format(
                          new Date(session.lastActiveAt),
                          "dd MMM yyyy · HH:mm",
                          { locale: dateLocale }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={revokingId === session.sessionId}
                    onClick={() => handleRevoke(session.sessionId)}
                    className="h-9 w-9 p-0 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm shrink-0 self-end sm:self-center"
                    title={t("devices.revoke_tooltip")}
                  >
                    {revokingId === session.sessionId ? (
                      <QhSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
