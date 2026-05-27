"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, BookOpen, Users, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AcademyPage() {
  const t = useTranslations("PublicAcademy");

  const featuredCourses = [
    {
      id: "ai-rad",
      title: t('courses.c1_title'),
      desc: t('courses.c1_desc'),
      instructor: t('courses.c1_instructor'),
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "tele-ethics",
      title: t('courses.c2_title'),
      desc: t('courses.c2_desc'),
      instructor: t('courses.c2_instructor'),
      color: "from-emerald-400 to-teal-500"
    },
    {
      id: "cardio-adv",
      title: t('courses.c3_title'),
      desc: t('courses.c3_desc'),
      instructor: t('courses.c3_instructor'),
      color: "from-rose-400 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block border border-medical-200 dark:border-medical-800 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
              {t('breadcrumb')}
            </span>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('title_light')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500 italic font-serif">{t('title_highlight')}</span>{t('title_dark')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-12">
              {t('subtitle')}
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder={t('search_ph')}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-medical-500 focus:bg-white dark:focus:bg-slate-800 rounded-full h-16 pl-12 pr-6 text-lg outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:shadow-md"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-medical-500" />
                <span className="text-2xl font-bold text-white">45+</span>
              </div>
              <p className="text-sm text-slate-400">{t('stats.courses')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-medical-500" />
                <span className="text-2xl font-bold text-white">12k+</span>
              </div>
              <p className="text-sm text-slate-400">{t('stats.students')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-medical-500" />
                <span className="text-2xl font-bold text-white">500+</span>
              </div>
              <p className="text-sm text-slate-400">{t('stats.hours')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('featured_title')}</h2>
            <Link href="#" className="hidden md:flex items-center gap-2 text-medical-600 dark:text-medical-400 font-medium hover:underline">
              Ver catálogo completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, idx) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-medical-900/10 transition-all flex flex-col h-full"
              >
                {/* Course Thumbnail placeholder */}
                <div className={`h-48 w-full bg-gradient-to-br ${course.color} relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-white/90 group-hover:scale-110 transition-all drop-shadow-md" />
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="text-xs font-bold text-medical-600 dark:text-medical-400 uppercase tracking-wider mb-3">Programa de Especialidad</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-light mb-6 flex-1 line-clamp-3">{course.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                        {course.instructor.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{course.instructor}</span>
                    </div>
                    <Button variant="ghost" className="text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/30 rounded-full">
                      {t('enroll_btn')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
