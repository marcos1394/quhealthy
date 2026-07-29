"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";
import axiosInstance from "@/lib/axios";

export default function StaffActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth.StaffActivation");

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError(t("errors.token_missing"));
    }
  }, [token, t]);

  const validatePassword = (pass: string) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[!@#$%^&*]/.test(pass)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError(t("errors.password_mismatch"));
      return;
    }

    if (!validatePassword(password)) {
      setError(t("errors.password_requirements"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/api/auth/staff/activate", {
        token,
        password,
      });

      toast.success(t("toasts.success"));
      router.push("/login");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || t("errors.generic");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ── VISTA: TOKEN INVÁLIDO O OMITIDO ──────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-red-100 dark:border-red-900/40 rounded-3xl p-8 shadow-sm space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("invalid_token_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("invalid_token_desc")}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => router.push("/")}
              className="w-full h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-xs font-bold transition-all border-0 shadow-sm"
            >
              {t("back_home")}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── VISTA PRINCIPAL: FORMULARIO DE ACTIVACIÓN ──────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" strokeWidth={2} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensaje de Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nueva Contraseña */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("new_password_label")}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-4 pr-10 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-sm"
                  placeholder={t("password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("confirm_password_label")}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 pl-4 pr-10 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-sm"
                  placeholder={t("password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de Acción */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all border-0 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("btn_activating")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("btn_activate")}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}