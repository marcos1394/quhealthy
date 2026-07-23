"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  BookOpen,
  Users,
  Clock,
  PlayCircle,
  ChevronRight,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import axiosInstance from "@/lib/axios";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface InstructorDto {
  name: string;
  avatarUrl?: string;
}

interface AcademyCourse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  instructor: InstructorDto;
  thumbnailUrl: string;
  category: string;
}

interface AcademyStats {
  totalCourses: number;
  totalStudents: number;
  totalHours: number;
}

export default function AcademyPage() {
  const t = useTranslations("PublicAcademy");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: isStatsLoading } = useSWR<AcademyStats>(
    "/api/catalog/academy/public/stats",
    (url: string) => axiosInstance.get(url).then((res) => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const { data: featuredCourses, isLoading: isCoursesLoading } = useSWR<
    AcademyCourse[]
  >(
    "/api/catalog/academy/public/courses/featured",
    (url: string) => axiosInstance.get(url).then((res) => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const filteredCourses = featuredCourses?.filter((course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.excerpt?.toLowerCase().includes(q) ||
      course.category?.toLowerCase().includes(q) ||
      course.instructor?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                {t("breadcrumb", { defaultValue: "Academia" })}
              </span>
            </div>

            <div className="max-w-4xl space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                {t("title_light", { defaultValue: "Educación Médica de " })}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {t("title_highlight", { defaultValue: "Vanguardia" })}
                </span>{" "}
                {t("title_dark", { defaultValue: "e Inteligencia Clínica" })}
              </h1>
              <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-2xl">
                {t("subtitle", { defaultValue: "Cursos, certificaciones y recursos impartidos por líderes y especialistas del sector salud." })}
              </p>
            </div>

            {/* Search Bar Input Contenido */}
            <div className="max-w-2xl pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_ph", { defaultValue: "Buscar por especialidad, tema o instructor..." })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 py-8">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Stat 1 */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <BookOpen className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                {isStatsLoading ? (
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                    {stats?.totalCourses || 0}+
                  </p>
                )}
                <p className="text-xs font-semibold text-gray-500">
                  {t("stats.courses", { defaultValue: "Cursos Especializados" })}
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Users className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                {isStatsLoading ? (
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                    {stats?.totalStudents || 0}+
                  </p>
                )}
                <p className="text-xs font-semibold text-gray-500">
                  {t("stats.students", { defaultValue: "Médicos y Alumnos" })}
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Clock className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                {isStatsLoading ? (
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                    {stats?.totalHours || 0}+
                  </p>
                )}
                <p className="text-xs font-semibold text-gray-500">
                  {t("stats.hours", { defaultValue: "Horas de Aprendizaje" })}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES SECTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          {/* Header Catálogo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Oferta Académica</span>
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
                {t("featured_title", { defaultValue: "Cursos y Programa de Formación" })}
              </h2>
            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {isCoursesLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3">
                <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold text-gray-400">Cargando cursos destacados...</p>
              </div>
            ) : !filteredCourses || filteredCourses.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                No se encontraron cursos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div className="aspect-[16/10] w-full bg-gray-100 dark:bg-gray-900 rounded-2xl relative overflow-hidden mb-5 shadow-sm">
                      <img
                        src={course.thumbnailUrl || "/api/placeholder/800/600"}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gray-950/20 group-hover:bg-gray-950/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-6 h-6 ml-0.5" strokeWidth={2} />
                        </div>
                      </div>

                      {/* Badge Categoria */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-800 px-3 py-1 rounded-full shadow-sm">
                        <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {course.category || "Especialidad"}
                        </span>
                      </div>
                    </div>

                    {/* Titulo y Descripción */}
                    <div className="space-y-2 mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {course.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        {course.instructor?.name?.charAt(0) || "I"}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[130px]">
                        {course.instructor?.name || "Instructor Invitado"}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                      <span>{t("enroll_btn", { defaultValue: "Inscribirse" })}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                    </span>
                  </div>

                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
}