"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, BookOpen, Users, Clock, PlayCircle, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";

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
    '/api/catalog/academy/public/stats',
    (url: string) => axiosInstance.get(url).then(res => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: featuredCourses, isLoading: isCoursesLoading } = useSWR<AcademyCourse[]>(
    '/api/catalog/academy/public/courses/featured',
    (url: string) => axiosInstance.get(url).then(res => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* Editorial Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black dark:text-white">{t('breadcrumb')}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
              <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-[1.1]">
                  {t('title_light')}
                  <br />
                  <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light pr-2">
                    {t('title_highlight')}
                  </span>
                  {t('title_dark')}
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Search Bar (Flush Design) */}
            <div className="max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_ph')}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-4 pl-10 pr-6 text-lg font-light outline-none transition-all focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-gray-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar (Estilo Periódico Financiero) */}
      <section className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
            <div className="py-8 md:py-10 flex flex-col justify-center items-start md:items-center">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                {isStatsLoading ? (
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                ) : (
                  <span className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tighter">{stats?.totalCourses || 0}+</span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('stats.courses')}</p>
            </div>
            <div className="py-8 md:py-10 flex flex-col justify-center items-start md:items-center">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                {isStatsLoading ? (
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                ) : (
                  <span className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tighter">{stats?.totalStudents || 0}+</span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('stats.students')}</p>
            </div>
            <div className="py-8 md:py-10 flex flex-col justify-center items-start md:items-center">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                {isStatsLoading ? (
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                ) : (
                  <span className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tighter">{stats?.totalHours || 0}+</span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('stats.hours')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses (Directorio a Corte Vivo) */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
              {t('featured_title')}
            </h2>
            <Link 
              href="#" 
              className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors pb-1"
            >
              Ver catálogo completo <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
          >
            {isCoursesLoading ? (
              <div className="col-span-full py-20 flex justify-center items-center">
                <div className="animate-pulse flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                </div>
              </div>
            ) : (!featuredCourses || featuredCourses.length === 0) ? (
              <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400 font-light">
                No hay cursos destacados por el momento.
              </div>
            ) : (
              featuredCourses.map((course) => (
                <motion.div 
                  key={course.id}
                  variants={itemVariants}
                  className="group flex flex-col h-full cursor-pointer"
                >
                  {/* Course Thumbnail */}
                  <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden mb-6">
                    <img 
                      src={course.thumbnailUrl || '/api/placeholder/800/600'}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-500">
                      <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" strokeWidth={1} />
                    </div>
                    <div className="absolute top-4 left-4 bg-black text-white dark:bg-white dark:text-black px-2.5 py-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest">{course.category || "Especialidad"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="text-2xl font-semibold text-black dark:text-white mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-light mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {course.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-xs font-bold text-black dark:text-white uppercase">
                          {course.instructor?.name?.charAt(0) || "I"}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                          {course.instructor?.name || "Instructor Invitado"}
                        </span>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        {t('enroll_btn')} <ArrowUpRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
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