"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  ArrowRight,
  Search,
  Calendar,
  Activity,
  Phone,
  Mail,
  Filter,
  MoreHorizontal,
  Edit,
  CalendarPlus,
  X,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { NewPatientModal } from "@/components/dashboard/NewPatientModal";
import { EditPatientModal } from "@/components/dashboard/EditPatientModal";
import { NewAppointmentModal } from "@/components/dashboard/NewAppointmentModal";

import { usePatientDirectory } from "@/hooks/usePatientDirectory";
import { PatientClient } from "@/types/patient";
import { PatientDirectoryProfile } from "@/types/medicalHistory";

export default function ProviderPatientsPage() {
  const t = useTranslations("DashboardPatients");
  const router = useRouter();

  const { clients, isLoading, fetchClients } = usePatientDirectory();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientClient | null>(
    null
  );
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] =
    useState<PatientDirectoryProfile | null>(null);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [patientForAppointment, setPatientForAppointment] =
    useState<PatientClient | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(
    (c) =>
      c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consumer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, client: PatientClient) => {
      e.stopPropagation();
      const nameParts = client.consumer.name.trim().split(/\s+/);
      setPatientToEdit({
        id: client.id,
        consumerId: client.consumer.id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" "),
        email: client.consumer.email || null,
        phone: client.consumer.phone || null,
        birthDate: null,
        gender: null,
        isPlatformUser: client.consumer.id !== null,
        createdAt: client.lastAppointmentDate,
      });
    },
    []
  );

  const handleStartConsultation = useCallback(
    (e: React.MouseEvent, client: PatientClient) => {
      e.stopPropagation();
      setPatientForAppointment(client);
      setIsNewAppointmentModalOpen(true);
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("title")}
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-0.5 text-[10px] font-mono font-bold shadow-sm">
                  {clients.length} {t("total_patients")}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle_populated")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="w-full md:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transition-all text-xs font-bold rounded-xl border-0 shadow-sm flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>{t("new_patient")}</span>
          </Button>
        </div>

        {/* ── BÚSQUEDA Y FILTROS ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="w-full h-11 pl-11 pr-4 bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            className="h-11 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 shrink-0"
          >
            <Filter className="w-4 h-4" strokeWidth={2} />
            <span>{t("more_filters")}</span>
          </Button>
        </div>

        {/* ── TABLA DE PACIENTES ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filteredClients.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden"
            >
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-[#050505]">
                  <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                    <TableHead className="h-12 pl-6 text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      {t("col_patient")}
                    </TableHead>
                    <TableHead className="h-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      {t("col_status")}
                    </TableHead>
                    <TableHead className="h-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      NOM-024
                    </TableHead>
                    <TableHead className="h-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      Adherencia
                    </TableHead>
                    <TableHead className="h-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      Resueltos
                    </TableHead>
                    <TableHead className="h-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      {t("col_appointments")}
                    </TableHead>
                    <TableHead className="h-12 text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      {t("col_last_visit")}
                    </TableHead>
                    <TableHead className="h-12 text-right pr-6 text-gray-400 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                      {t("col_actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      onClick={() => setSelectedPatient(client)}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 border-b-gray-100 dark:border-b-gray-800 transition-colors cursor-pointer group"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {client.consumer.profileImageUrl ? (
                              <img
                                src={client.consumer.profileImageUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">
                                {client.consumer.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {client.consumer.name}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400 truncate mt-0.5">
                              {client.consumer.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-0.5 text-[10px] font-bold border rounded-full whitespace-nowrap shadow-sm",
                            client.status === "active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400"
                              : "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              client.status === "active"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            )}
                          />
                          {client.status === "active"
                            ? t("status_active")
                            : t("status_inactive")}
                        </span>
                      </TableCell>

                      <TableCell className="text-center py-4">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                (client.consumer.nom024CompliancePercentage ||
                                  0) >= 100
                                  ? "bg-emerald-500"
                                  : (client.consumer.nom024CompliancePercentage ||
                                      0) >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              )}
                              style={{
                                width: `${
                                  client.consumer.nom024CompliancePercentage || 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-gray-400">
                            {Math.round(
                              client.consumer.nom024CompliancePercentage || 0
                            )}
                            %
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center py-4">
                        {client.consumer.treatmentAdherencePercentage !== undefined ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  client.consumer.treatmentAdherencePercentage >= 80
                                    ? "bg-emerald-500"
                                    : client.consumer.treatmentAdherencePercentage >= 50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                )}
                                style={{ width: `${client.consumer.treatmentAdherencePercentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-gray-400">
                              {client.consumer.treatmentAdherencePercentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center py-4">
                        {client.consumer.resolvedDiagnosesCount !== undefined && client.consumer.resolvedDiagnosesCount > 0 ? (
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-mono font-bold text-xs shadow-sm">
                            {client.consumer.resolvedDiagnosesCount}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center py-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-mono font-bold text-xs shadow-sm">
                          {client.totalAppointments}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          <Calendar
                            className="w-3.5 h-3.5 text-gray-400"
                            strokeWidth={2}
                          />
                          <span>
                            {format(
                              new Date(client.lastAppointmentDate),
                              "PP",
                              { locale: es }
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors ml-auto text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <MoreHorizontal
                                className="h-4 w-4"
                                strokeWidth={2}
                              />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl w-48 p-1"
                          >
                            <DropdownMenuItem
                              onClick={(e) => handleStartConsultation(e, client)}
                              className="text-xs font-bold focus:bg-emerald-50 dark:focus:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 cursor-pointer rounded-xl py-2.5"
                            >
                              <CalendarPlus
                                className="w-3.5 h-3.5 mr-2"
                                strokeWidth={2}
                              />
                              <span>{t("start_consultation")}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/provider/dashboard/patients/${client.id}`
                                );
                              }}
                              className="text-xs font-bold focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl py-2.5"
                            >
                              <Activity
                                className="w-3.5 h-3.5 mr-2 text-gray-500 dark:text-gray-400"
                                strokeWidth={2}
                              />
                              <span>{t("view_full_record")}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => handleEditClick(e, client)}
                              className="text-xs font-bold focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl py-2.5"
                            >
                              <Edit
                                className="w-3.5 h-3.5 mr-2 text-gray-400"
                                strokeWidth={2}
                              />
                              <span>{t("edit_contact")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm p-8 gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                <Users className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {t("empty_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {searchTerm ? t("empty_search") : t("empty_list")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PATIENT DRAWER (FICHA TÉCNICA) ─────────────────────────────────── */}
      <Sheet
        open={!!selectedPatient}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
      >
        <SheetContent className="bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 sm:max-w-md w-full p-0 shadow-2xl flex flex-col transition-colors [&>button]:hidden">
          {selectedPatient && (
            <div className="h-full flex flex-col min-h-0">
              
              {/* Header Drawer con Botón de Cierre Integrado */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#050505] shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                    <User className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <SheetTitle className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight truncate">
                      {t("sheet_title")}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t("sheet_desc")}
                    </SheetDescription>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 border border-gray-200/50 dark:border-gray-800 ml-2"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Contenido Drawer Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-white dark:bg-[#0a0a0a]">
                
                {/* 1. Tarjeta Hero de Identidad del Paciente */}
                <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden shadow-2xs shrink-0 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    {selectedPatient.consumer.profileImageUrl ? (
                      <img
                        src={selectedPatient.consumer.profileImageUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="uppercase">
                        {selectedPatient.consumer.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                      {selectedPatient.consumer.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-[#111] rounded-md px-1.5 py-0.5 border border-gray-200/60 dark:border-gray-800">
                        #{selectedPatient.consumer.id || selectedPatient.id}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded-md",
                          selectedPatient.status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400"
                            : "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            selectedPatient.status === "active"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          )}
                        />
                        {selectedPatient.status === "active"
                          ? t("status_active")
                          : t("status_inactive")}
                      </span>
                      {selectedPatient.consumer.id ? (
                        <span className="inline-flex items-center text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:border-sky-900/40 dark:text-sky-400 rounded-md px-1.5 py-0.5">
                          App
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400 rounded-md px-1.5 py-0.5">
                          Local
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Indicadores Clínicos y NOM-024 */}
                <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Indicadores Clínicos
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 font-mono">NOM-024</span>
                  </div>

                  {/* NOM-024 Progress */}
                  <div className="space-y-1.5 bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Cumplimiento NOM-024</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {Math.round(selectedPatient.consumer.nom024CompliancePercentage || 0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          (selectedPatient.consumer.nom024CompliancePercentage || 0) >= 100
                            ? "bg-emerald-500"
                            : (selectedPatient.consumer.nom024CompliancePercentage || 0) >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        )}
                        style={{
                          width: `${selectedPatient.consumer.nom024CompliancePercentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Adherencia y Casos Resueltos */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Adherencia
                      </span>
                      <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                        {selectedPatient.consumer.treatmentAdherencePercentage !== undefined
                          ? `${selectedPatient.consumer.treatmentAdherencePercentage}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        Casos Resueltos
                      </span>
                      <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                        {selectedPatient.consumer.resolvedDiagnosesCount !== undefined &&
                        selectedPatient.consumer.resolvedDiagnosesCount > 0
                          ? `${selectedPatient.consumer.resolvedDiagnosesCount}`
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Resumen de Citas y Visitas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 shadow-2xs flex flex-col">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                      <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      {t("total_visits")}
                    </span>
                    <span className="text-base font-mono font-bold text-gray-900 dark:text-white">
                      {selectedPatient.totalAppointments} {selectedPatient.totalAppointments === 1 ? "cita" : "citas"}
                    </span>
                  </div>

                  <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 shadow-2xs flex flex-col">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      {t("last_visit")}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                      {(() => {
                        if (!selectedPatient.lastAppointmentDate) return "Sin citas previas";
                        try {
                          const d = new Date(selectedPatient.lastAppointmentDate);
                          if (isNaN(d.getTime())) return "Sin citas previas";
                          return format(d, "d MMM yyyy", { locale: es });
                        } catch {
                          return "Sin citas previas";
                        }
                      })()}
                    </span>
                  </div>
                </div>

                {/* 4. Información de Contacto */}
                <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-gray-100/40 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("contact_info")}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                    <div className="flex items-center gap-3 p-3.5">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {selectedPatient.consumer.email || "Sin correo registrado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3.5">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.consumer.phone || "Sin teléfono registrado"}
                      </span>
                    </div>
                    {selectedPatient.consumer.curp && (
                      <div className="flex items-center justify-between p-3.5">
                        <span className="text-[10px] font-bold uppercase text-gray-400">CURP</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white uppercase text-[11px]">
                          {selectedPatient.consumer.curp}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Drawer */}
              <div className="p-5 bg-gray-50/70 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col gap-2.5">
                <Button
                  onClick={(e) => handleStartConsultation(e, selectedPatient)}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center justify-center gap-2 text-xs font-bold transition-all rounded-xl shadow-xs border-0 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                  <span>{t("start_consultation")}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/provider/dashboard/patients/${selectedPatient.id}`
                    )
                  }
                  className="w-full h-11 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center gap-2 text-xs font-bold transition-all rounded-xl shadow-2xs cursor-pointer"
                >
                  <span>{t("view_medical_record")}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── MODALES DE CREACIÓN, EDICIÓN Y CONSULTA ─────────────────────── */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={async () => {
          await fetchClients();
        }}
      />

      <EditPatientModal
        isOpen={!!patientToEdit}
        patient={patientToEdit}
        onClose={() => setPatientToEdit(null)}
        onUpdated={async () => {
          await fetchClients();
          setPatientToEdit(null);
        }}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => {
          setIsNewAppointmentModalOpen(false);
          setPatientForAppointment(null);
        }}
        initialPatient={patientForAppointment}
        onSuccess={async () => {
          await fetchClients();
        }}
      />
    </div>
  );
}