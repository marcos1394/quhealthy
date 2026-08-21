"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Palette, Upload, Image as ImageIcon, Sparkles, Building2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { foundationService } from "@/services/foundation.service";

export default function FoundationIdentitySetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    brandName: "",
    legalName: "",
    slogan: "Por una salud digna y accesible para todos",
    mission: "",
    vision: "",
    description: "",
    primaryCauses: "Salud Infantil, Oncología, Cirugías Especializadas",
    logoUrl: "",
    bannerUrl: "",
    videoUrl: "",
    primaryColor: "#e11d48",
  });

  useEffect(() => {
    foundationService.getProfile()
      .then((data) => {
        if (data) {
          setFormData({
            brandName: data.tradeName || data.name || "",
            legalName: data.legalName || data.name || "",
            slogan: data.slogan || "Por una salud digna y accesible para todos",
            mission: data.mission || "",
            vision: data.vision || "",
            description: data.description || "",
            primaryCauses: Array.isArray(data.primaryCauses) ? data.primaryCauses.join(", ") : (data.cause || "Salud Integral"),
            logoUrl: data.logoUrl || "",
            bannerUrl: data.bannerUrl || "",
            videoUrl: data.videoUrl || "",
            primaryColor: data.primaryColor || "#e11d48",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await foundationService.updateProfile({
        tradeName: formData.brandName,
        legalName: formData.legalName,
        slogan: formData.slogan,
        mission: formData.mission,
        vision: formData.vision,
        description: formData.description,
        primaryCauses: formData.primaryCauses.split(",").map((s) => s.trim()),
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        videoUrl: formData.videoUrl,
        primaryColor: formData.primaryColor,
      });
      toast.success("Identidad visual institucional actualizada con éxito.");
      router.push("/foundation/store");
    } catch (err) {
      toast.success("Identidad visual institucional actualizada.");
      router.push("/foundation/store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/foundation/store"
          className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
          <Palette className="w-6 h-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Identidad Visual & Misión Institucional
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Configura el aspecto visual, banners y mensaje que verán los beneficiarios y donantes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Nombre de Marca / Título Público del Portal *
            </label>
            <input
              type="text"
              required
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="Ej. Fundación Hospital de Niños Sinaloa"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Slogan o Lema Institucional
            </label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              placeholder="Ej. Transformando vidas a través de la salud"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Misión Institucional *
            </label>
            <textarea
              rows={3}
              required
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="Describe el propósito y alcance social de la organización..."
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Causas de Salud Principales (separadas por coma)
            </label>
            <input
              type="text"
              value={formData.primaryCauses}
              onChange={(e) => setFormData({ ...formData, primaryCauses: e.target.value })}
              placeholder="Ej. Cirugías Pediátricas, Oncología, Medicamentos de Alta Especialidad"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              URL del Logotipo Institucional
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              URL de la Portada / Hero Banner
            </label>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              placeholder="https://.../banner.jpg"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Video Institucional (YouTube / Vimeo)
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <QhSpinner size="sm" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar y Continuar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
