"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Laptop, Smartphone, Monitor } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

export function ActiveSessionsList() {
  const t = useTranslations("SettingsActiveSessions");
  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await securityService.getActiveSessions();
      setSessions(data || []);
    } catch (error) {
      console.error("Error al obtener sesiones:", error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    setIsRevoking(sessionId);
    try {
      await securityService.revokeSession(sessionId);
      toast.success(t("toast_revoke_success"));
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (error) {
      console.error(error);
      toast.error(t("toast_revoke_error"));
    } finally {
      setIsRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setIsRevoking("ALL");
    try {
      await securityService.revokeAllExceptCurrent();
      toast.success(t("toast_revoke_all_success"));
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (error) {
      console.error(error);
      toast.error(t("toast_revoke_all_error"));
    } finally {
      setIsRevoking(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex items-center justify-center min-h-[250px] font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO Y BOTÓN DE REVOCAR TODAS ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {otherSessions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRevokeAll}
            disabled={isRevoking === "ALL"}
            className="rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-10 px-4 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isRevoking === "ALL" ? (
              <>
                <QhSpinner size="sm" className="text-rose-600 dark:text-rose-400" />
                <span>{t("btn_revoking")}</span>
              </>
            ) : (
              <span>{t("btn_revoke_all")}</span>
            )}
          </Button>
        )}
      </div>

      {/* ── LISTA DE SESIONES ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {sessions.map((session) => {
          const deviceLower = session.deviceName?.toLowerCase() || "";
          const isLaptop =
            deviceLower.includes("mac") || deviceLower.includes("windows");
          const isPhone =
            deviceLower.includes("iphone") || deviceLower.includes("android");

          return (
            <div
              key={session.sessionId}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-[#050505]"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  {isLaptop ? (
                    <Laptop className="w-5 h-5" strokeWidth={2} />
                  ) : isPhone ? (
                    <Smartphone className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Monitor className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {session.deviceName || t("unknown_device")}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                    <span>{session.ipAddress}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span>
                      {t("last_active", {
                        time: new Date(session.lastActiveAt).toLocaleString(),
                      })}
                    </span>
                  </div>

                  {session.current && (
                    <div className="pt-1">
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                        {t("current_device")}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {!session.current && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRevoke(session.sessionId)}
                  disabled={isRevoking === session.sessionId}
                  className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 h-9 px-4 text-xs font-bold transition-all self-start sm:self-auto shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isRevoking === session.sessionId ? (
                    <>
                      <QhSpinner size="sm" className="text-rose-600 dark:text-rose-400 mr-1.5" />
                      <span>{t("btn_revoking")}</span>
                    </>
                  ) : (
                    <span>{t("btn_revoke")}</span>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}