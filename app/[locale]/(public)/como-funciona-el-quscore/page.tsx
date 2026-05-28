"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Activity, UserCheck, Star, FileText, 
  CheckCircle2, Info, ArrowRight, Award
} from "lucide-react";
import { providerScoreService } from "@/services/providerScore.service";
import { QuScoreMethodologyResponse } from "@/types/providerScore";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function QuScoreMethodologyPage() {
  const [methodology, setMethodology] = useState<QuScoreMethodologyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    providerScoreService.getScoreMethodology()
      .then(setMethodology)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getPillarIcon = (key: string) => {
    switch (key) {
      case 'P1': return <ShieldCheck className="w-8 h-8 text-indigo-500" />;
      case 'P2': return <Star className="w-8 h-8 text-amber-500" />;
      case 'P3': return <UserCheck className="w-8 h-8 text-emerald-500" />;
      case 'P4': return <Activity className="w-8 h-8 text-rose-500" />;
      case 'P5': return <FileText className="w-8 h-8 text-blue-500" />;
      default: return <Info className="w-8 h-8 text-slate-500" />;
    }
  };

  const getBandColor = (bandName: string) => {
    switch(bandName) {
      case 'ELITE': return 'from-amber-400 to-amber-600';
      case 'PREMIUM': return 'from-purple-500 to-purple-700';
      case 'ADVANCED': return 'from-blue-500 to-blue-700';
      case 'IN_PROGRESS': return 'from-slate-400 to-slate-600';
      case 'NUEVO': return 'from-zinc-300 to-zinc-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Cargando Metodología QuScore...</p>
      </div>
    );
  }

  if (!methodology) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Error al cargar la información.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] font-sans selection:bg-purple-500/30 text-slate-900 dark:text-white pb-32">
      
      {/* HEADER HERO */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-[#09090b] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md mb-6 px-4 py-1.5 uppercase tracking-widest text-xs">Transparencia QuHealthy</Badge>
            <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              ¿Cómo funciona el QuScore?
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              {methodology.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-12">
        
        {/* METADATA */}
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-6 flex flex-wrap justify-between items-center text-sm font-medium text-slate-500 dark:text-zinc-400 gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Versión del Algoritmo: <strong className="text-slate-900 dark:text-white">{methodology.algorithmVersion}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Última Revisión: <strong className="text-slate-900 dark:text-white">{new Date(methodology.lastReviewedAt).toLocaleDateString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Dudas o Feedback: <a href={`mailto:${methodology.feedbackContact}`} className="text-purple-600 dark:text-purple-400 hover:underline">{methodology.feedbackContact}</a></span>
          </div>
        </div>

        {/* 5 PILLARS */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">Los 5 Pilares de la Calidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(methodology.weights).map(([key, pillar], idx) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                    {getPillarIcon(key)}
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{pillar.weightPercentage}%</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.name}</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed min-h-[60px]">
                  {pillar.description}
                </p>
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/10">
                  {pillar.criteria.map((crit, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BANDS */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">Niveles de Reconocimiento</h2>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            {methodology.scoreBands.map((band, idx) => (
              <div key={idx} className={`p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 ${idx !== methodology.scoreBands.length - 1 ? 'border-b border-slate-100 dark:border-white/10' : ''}`}>
                <div className={`w-32 shrink-0 py-2 px-4 rounded-full text-center font-bold text-white text-sm bg-gradient-to-r ${getBandColor(band.bandName)} shadow-md`}>
                  {band.bandName}
                </div>
                <div className="flex-1">
                  <div className="text-slate-500 dark:text-zinc-400 font-mono text-sm mb-1 uppercase tracking-widest">
                    {band.minScore === 0 && band.maxScore === 0 
                      ? 'No aplica' 
                      : `${band.minScore} - ${band.maxScore} PUNTOS`}
                  </div>
                  <p className="text-slate-700 dark:text-zinc-200">{band.description}</p>
                </div>
                {band.minScore >= 750 && (
                  <div className="hidden sm:block">
                    <Award className="w-10 h-10 text-slate-200 dark:text-white/5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TRANSPARENCY NOTE (CAT-P02) */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-6 sm:p-8 mt-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Transparencia en Resultados Patrocinados</h3>
              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed">
                El QuScore es un algoritmo estrictamente orgánico y ético. En QuHealthy, cualquier clínica o especialista que decida invertir en promoción publicitaria siempre aparecerá claramente marcado con la etiqueta <strong>"Patrocinado"</strong> y agrupado de forma independiente. <strong className="text-slate-900 dark:text-white">Ningún pago o patrocinio puede alterar, comprar o influir en la calificación del QuScore</strong> ni en la posición dentro del ranking orgánico de resultados.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Badge helper
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
}
