"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Search, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Tag, 
  ArrowUpRight,
  FileText
} from "lucide-react";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// Interfaz esperada del backend
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  keywords: string[];
  createdAt: string;
  imageUrl: string;
}

const fetcher = (url: string) =>
  axiosInstance.get<BlogPost[]>(url).then((res) => res.data);

export default function BlogPage() {
  const t = useTranslations("PublicBlog");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  const categories = [
    t("categories.all", { defaultValue: "Todos" }),
    t("categories.mental_health", { defaultValue: "Salud Mental" }),
    t("categories.nutrition", { defaultValue: "Nutrición" }),
    t("categories.dermatology", { defaultValue: "Dermatología" }),
    t("categories.innovation", { defaultValue: "Innovación Médica" }),
    t("categories.lifestyle", { defaultValue: "Estilo de Vida" }),
  ];

  const {
    data: posts,
    isLoading,
    error,
  } = useSWR<BlogPost[]>("/api/intelligence/blog/posts", fetcher);

  // Filtro simple en cliente por búsqueda
  const filteredPosts =
    posts?.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords?.some((kw) =>
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ) || [];

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.slice(1);

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO & CATEGORÍAS ────────────────────────────────────────────── */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                Editorial
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  {t("title_light", { defaultValue: "Publicaciones e " })}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t("title_highlight", { defaultValue: "Inteligencia" })}
                  </span>{" "}
                  {t("title_dark", { defaultValue: "en Salud" })}
                </h1>
                <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-2xl">
                  {t("subtitle", { defaultValue: "Análisis clínicos, tendencias en salud digital y guías de bienestar redactadas por especialistas." })}
                </p>
              </div>

              {/* Search Bar Contenido */}
              <div className="w-full md:w-80 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("search_ph", { defaultValue: "Buscar artículos..." })}
                    className="w-full h-12 pl-10 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Pestañas de Categorías estilo Pill */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 scrollbar-hide">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(idx)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border",
                    selectedCategory === idx
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-50 dark:bg-[#050505] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECCIÓN PRINCIPAL DE CONTENIDO ─────────────────────────────── */}
      <section className="py-12 md:py-20 min-h-[50vh]">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          {/* State: Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-400">
                {t("loading", { defaultValue: "Cargando artículos editoriales..." })}
              </p>
            </div>
          )}

          {/* State: Error o Sin publicaciones */}
          {!isLoading && (!posts || posts.length === 0) && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto text-gray-400">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("empty_title", { defaultValue: "No hay artículos disponibles" })}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("empty_desc", { defaultValue: "Pronto publicaremos nuevo contenido editorial en esta categoría." })}
                </p>
              </div>
            </div>
          )}

          {/* State: Búsqueda sin resultados */}
          {!isLoading &&
            posts &&
            posts.length > 0 &&
            filteredPosts.length === 0 && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm space-y-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Sin coincidencias
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {t("no_results", { defaultValue: "No encontramos artículos para el término ingresado." })}
                </p>
              </div>
            )}

          {/* ── DESTACADO PRINCIPAL ────────────────────────────────────────── */}
          {!isLoading && featuredPost && !searchQuery && (
            <Link href={`/${locale}/blog/${featuredPost.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 transition-all grid md:grid-cols-2 gap-8 items-center mb-12 group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-sm">
                  <img
                    src={featuredPost.imageUrl}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-800 px-3 py-1 rounded-full shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {featuredPost.keywords?.[0] || "Health Tech"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {new Date(featuredPost.createdAt).toLocaleDateString(
                        locale === "es" ? "es-MX" : "en-US",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Artículo Destacado</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>{t("read_more", { defaultValue: "Leer artículo completo" })}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )}

          {/* ── GRID DE ARTÍCULOS SECUNDARIOS ─────────────────────────────── */}
          {!isLoading && regularPosts.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {regularPosts.map((post, idx) => (
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  key={post.id || idx}
                >
                  <motion.article
                    variants={itemVariants}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full group cursor-pointer"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 mb-5 shadow-sm">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-800 px-2.5 py-0.5 rounded-full shadow-sm">
                          <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {post.keywords?.[0] || "Salud"}
                          </span>
                        </div>
                      </div>

                      {/* Info Header */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                          <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              locale === "es" ? "es-MX" : "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Footer Card */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        QuHealthy Editorial
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </motion.article>
                </Link>
              ))}
            </motion.div>
          )}

          {/* Botón Cargar Más */}
          {!isLoading && regularPosts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
              >
                {t("load_more", { defaultValue: "Cargar más artículos" })}
              </button>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}