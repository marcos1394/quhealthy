"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useTranslations } from "next-intl";
import {
  User,
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  HeartHandshake,
  Award,
  Camera,
  Download,
  Printer,
  Edit3,
  Stethoscope,
  Pill,
  Scissors,
} from "lucide-react";
import { ConsumerProfile } from "@/types/consumerProfile";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface PatientMedicalSummaryCVProps {
  profile: ConsumerProfile;
  userEmail?: string;
  onEditClick?: () => void;
  onPhotoClick?: () => void;
  onDownloadPdf?: () => void;
  onPrint?: () => void;
  isDownloadingPdf?: boolean;
}

export const PatientMedicalSummaryCV: React.FC<PatientMedicalSummaryCVProps> = ({
  profile,
  userEmail,
  onEditClick,
  onPhotoClick,
  onDownloadPdf,
  onPrint,
  isDownloadingPdf = false,
}) => {
  const t = useTranslations("PatientProfile");

  // Cálculo dinámico de edad
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.birthDate);
  const fullName = profile.fullName || t("title");
  const bloodType = profile.bloodType || "N/D";
  const curp = profile.curp || (profile.personalBackground?.curp as string) || "—";
  const rfc = profile.rfc || (profile.personalBackground?.rfc as string) || "—";
  const insuranceProvider =
    profile.insuranceProvider ||
    (profile.personalBackground?.insuranceProvider as string) ||
    profile.healthInsurance ||
    t("insurance_type_none");
  const insurancePolicyNumber =
    profile.insurancePolicyNumber ||
    (profile.personalBackground?.insurancePolicyNumber as string) ||
    "N/A";
  const insuranceType =
    profile.insuranceType ||
    (profile.personalBackground?.insuranceType as string) ||
    "NONE";
  const insurancePlanName =
    profile.insurancePlanName ||
    (profile.personalBackground?.insurancePlanName as string) ||
    "";
  const organDonor =
    profile.organDonor ||
    (profile.personalBackground?.organDonor as string) ||
    "FAMILY_DECIDES";

  const getDonorLabel = (val: string) => {
    if (val === "YES") return t("cv_summary.donor_yes");
    if (val === "NO") return t("cv_summary.donor_no");
    return t("cv_summary.donor_family");
  };

  const getInsuranceTypeLabel = (type: string) => {
    if (type === "PUBLIC") return t("insurance_type_public");
    if (type === "PRIVATE") return t("insurance_type_private");
    return t("insurance_type_none");
  };

  const getSexLabel = (sex?: string) => {
    if (sex === "MALE") return t("sex_male_option");
    if (sex === "FEMALE") return t("sex_female_option");
    return sex || "—";
  };

  const address = [
    profile.addressStreet || (profile.personalBackground?.addressStreet as string),
    profile.addressCity || profile.location || (profile.personalBackground?.addressCity as string),
    profile.addressState || (profile.personalBackground?.addressState as string),
    profile.addressPostalCode || (profile.personalBackground?.addressPostalCode as string),
  ]
    .filter(Boolean)
    .join(", ");

  const allergiesList = (profile.allergies || [])
    .map((a: any) => (typeof a === "string" ? a : a?.name || ""))
    .filter(Boolean);

  const medicationsList = profile.currentMedications || [];
  const chronicDiseases =
    profile.chronicDiseases ||
    (profile.personalBackground?.chronicDiseases as string) ||
    "";
  const surgeries =
    profile.surgeries ||
    (profile.personalBackground?.surgeries as string) ||
    "";
  const implantsDevices =
    profile.implantsDevices ||
    (profile.personalBackground?.implantsDevices as string) ||
    "";
  const vaccinations =
    profile.vaccinations ||
    (profile.personalBackground?.vaccinations as string) ||
    "";

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden font-sans text-gray-900 dark:text-white transition-all print:border-none print:shadow-none print:m-0 print:p-0 print:bg-white print:text-black">
      
      {/* ── ENCABEZADO EJECUTIVO / PASAPORTE MÉDICO ──────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 print:bg-slate-900 print:text-white relative overflow-hidden">
        {/* Marca de agua institucional */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Foto de Perfil / Avatar */}
            <div
              onClick={onPhotoClick}
              className={cn(
                "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-white/20 bg-white/10 p-1 shrink-0 shadow-lg overflow-hidden flex items-center justify-center relative backdrop-blur-md",
                onPhotoClick && "cursor-pointer group hover:border-emerald-400/50 transition-all"
              )}
              title={onPhotoClick ? t("change_photo") : undefined}
            >
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <User className="w-12 h-12 text-white/60 group-hover:scale-105 transition-transform duration-300" />
              )}
              {onPhotoClick ? (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white gap-1 backdrop-blur-xs no-print">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span className="text-[9px] font-bold text-center px-1">{t("selfie_button_tooltip")}</span>
                </div>
              ) : null}
              <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-900 z-10">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Datos Principales */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {t("cv_summary.header_badge")}
                </span>
                <span className="text-[10px] font-mono text-white/60">
                  {t("cv_summary.norm_badge")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {fullName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/80 font-medium pt-1">
                {age !== null && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("cv_summary.years_old", { age, birthDate: profile.birthDate || "" })}</span>
                  </span>
                )}
                {profile.biologicalSex && (
                  <>
                    <span className="text-white/40">•</span>
                    <span>{t("cv_summary.sex_label", { sex: getSexLabel(profile.biologicalSex) })}</span>
                  </>
                )}
                {profile.nationality && (
                  <>
                    <span className="text-white/40">•</span>
                    <span>{profile.nationality}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badges Clave de Emergencia (Grupo Sanguíneo & Donador) */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            <div className="bg-rose-500 text-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 border border-rose-400/40">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              <div className="text-left sm:text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-wider block opacity-90">
                  {t("cv_summary.blood_group_title")}
                </span>
                <span className="text-lg font-black font-mono leading-none">
                  {bloodType}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/15 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold">
                {t("cv_summary.donor_title", { donor: getDonorLabel(organDonor) })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA DE ACCIONES RÁPIDAS (DESCARGAR PDF / IMPRIMIR / EDITAR) ── */}
      {(onDownloadPdf || onPrint || onEditClick) && (
        <div className="bg-gray-50/80 dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-gray-800 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              {t("official_summary_label")}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
              {t("official_summary_ready")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
              >
                {isDownloadingPdf ? (
                  <QhSpinner size="sm" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? t("btn_generating_pdf") : t("btn_download_pdf")}</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151515] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5 cursor-pointer"
                title={t("btn_print")}
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">{t("btn_print")}</span>
              </button>
            )}

            {onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151515] text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t("tab_edit_data")}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CUERPO DEL CV CLÍNICO (GRID DE 2 COLUMNAS) ────────────────── */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 print:p-4 print:gap-6">
        
        {/* ── COLUMNA 1: IDENTIFICACIÓN, SEGURO Y CONTACTOS ───────────── */}
        <div className="space-y-6">
          
          {/* 1.1 Identificación y Demografía */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.section_identity")}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-0.5 print:bg-white print:border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {t("cv_summary.label_curp")}
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white truncate block">
                  {curp}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-0.5 print:bg-white print:border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {t("cv_summary.label_rfc")}
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white truncate block">
                  {rfc}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-0.5 print:bg-white print:border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {t("cv_summary.label_civil_state")}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 block capitalize">
                  {profile.maritalStatus || (profile.personalBackground?.maritalStatus as string) || "—"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-0.5 print:bg-white print:border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  {t("cv_summary.label_occupation")}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                  {profile.occupation || (profile.personalBackground?.occupation as string) || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* 1.2 Cobertura Médica & Póliza de Seguro */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.section_insurance")}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3 print:bg-white print:border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    {getInsuranceTypeLabel(insuranceType)}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {insuranceProvider}
                  </h4>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  {insuranceType === "NONE" ? "—" : "Active"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/60 dark:border-emerald-900/30 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block">
                    {t("cv_summary.label_policy")}:
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {insurancePolicyNumber}
                  </span>
                </div>
                {insurancePlanName && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block">
                      {t("cv_summary.label_plan")}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {insurancePlanName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1.3 Contacto Directo & Domicilio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.section_location")}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-semibold">{profile.phoneNumber || "—"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-medium">{userEmail || "—"}</span>
              </div>
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* 1.4 Contacto de Emergencia */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.section_emergency")}
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5 text-xs print:bg-white print:border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">
                  {profile.emergencyContactName || (profile.personalBackground?.emergencyContactName as string) || "—"}
                </span>
                {(profile.emergencyContactRelationship || (profile.personalBackground?.emergencyContactRelationship as string)) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                    {profile.emergencyContactRelationship || (profile.personalBackground?.emergencyContactRelationship as string)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-mono font-bold pt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.emergencyContactPhone || (profile.personalBackground?.emergencyContactPhone as string) || "—"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── COLUMNA 2: RESUMEN CLÍNICO & ANTECEDENTES NOM-004 ───────── */}
        <div className="space-y-6">
          
          {/* 2.1 Alergias Críticas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.label_allergies")}
              </h3>
            </div>

            {allergiesList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allergiesList.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 flex items-center gap-1.5 shadow-2xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{allergy}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs text-gray-500 font-medium">
                {t("cv_summary.no_allergies")}
              </div>
            )}
          </div>

          {/* 2.2 Diagnósticos & Padecimientos Crónicos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.section_chronic")}
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed print:bg-white print:border-gray-200">
              {chronicDiseases ? (
                <p className="font-medium whitespace-pre-line">{chronicDiseases}</p>
              ) : (
                <span className="text-gray-400 font-medium">
                  {t("cv_summary.no_chronic")}
                </span>
              )}
            </div>
          </div>

          {/* 2.3 Farmacoterapia Activa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
              <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {t("cv_summary.label_medications")}
              </h3>
            </div>

            {medicationsList.length > 0 ? (
              <div className="space-y-2">
                {medicationsList.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{med}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs text-gray-500 font-medium">
                {t("cv_summary.no_medications")}
              </div>
            )}
          </div>

          {/* 2.4 Antecedentes Quirúrgicos & Dispositivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1 text-xs print:bg-white print:border-gray-200">
              <span className="text-[10px] font-bold uppercase text-gray-400 block flex items-center gap-1">
                <Scissors className="w-3 h-3 text-emerald-600" />
                {t("cv_summary.section_surgeries")}
              </span>
              <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug">
                {surgeries || t("cv_summary.no_surgeries")}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1 text-xs print:bg-white print:border-gray-200">
              <span className="text-[10px] font-bold uppercase text-gray-400 block flex items-center gap-1">
                <HeartHandshake className="w-3 h-3 text-emerald-600" />
                {t("cv_summary.section_implants")}
              </span>
              <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug">
                {implantsDevices || t("cv_summary.no_implants")}
              </p>
            </div>
          </div>

          {/* 2.5 Vacunación & Hábitos */}
          {vaccinations && (
            <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1 text-xs print:bg-white print:border-gray-200">
              <span className="text-[10px] font-bold uppercase text-gray-400 block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {t("cv_summary.section_vaccines")}
              </span>
              <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug">
                {vaccinations}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── PIE DE PÁGINA OFICIAL / FOLIO DE EXPEDIENTE ──────────────── */}
      <div className="bg-gray-50 dark:bg-[#080808] p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium print:bg-white print:border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 flex items-center justify-center font-black text-emerald-600 font-mono text-sm shadow-2xs">
            Q
          </div>
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {t("cv_summary.footer_title")}
            </p>
            <p className="text-[10px] text-gray-400">
              {t("cv_summary.footer_legal")}
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right text-[10px] text-gray-400 font-mono">
          <span>{t("cv_summary.footer_generated", { date: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) })}</span>
        </div>
      </div>

    </div>
  );
};
