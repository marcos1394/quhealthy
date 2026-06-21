"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Activity, UserCheck, Star, FileText, 
  CheckCircle2, Info, Award
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
      case 'P1': return <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />;
      case 'P2': return <Star className="w-5 h-5" strokeWidth={1.5} />;
      case 'P3': return <UserCheck className="w-5 h-5" strokeWidth={1.5} />;
      case 'P4': return <Activity className="w-5 h-5" strokeWidth={1.5} />;
      case 'P5': return <FileText className="w-5 h-5" strokeWidth={1.5} />;
      default: return <Info className="w-5 h-5" strokeWidth={1.5} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">SINTETIZANDO METODOLOGÍA...</p>
      </div>
    );
  }

  if (!methodology) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">ERROR AL CARGAR LA INFORMACIÓN.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-32 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* HERO EDITORIAL */}
      <div className="border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif italic tracking-tight text-black dark:text-white">
              ¿Cómo funciona el QuScore?
            </h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-3xl leading-relaxed">
            {methodology.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
        
        {/* METADATA BAR */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col md:flex-row md:items-center justify-between p-0 divide-y md:divide-y-0 md:divide-x divide-black dark:divide-white text-[10px] font-bold uppercase tracking-widest">
          <div className="p-4 flex-1 flex items-center gap-3">
            <Info className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
            <span className="text-gray-500">ALGORITMO V:</span>
            <span className="text-black dark:text-white">{methodology.algorithmVersion}</span>
          </div>
          <div className="p-4 flex-1 flex items-center gap-3">
            <span className="text-gray-500">ÚLTIMA REVISIÓN:</span>
            <span className="text-black dark:text-white">{new Date(methodology.lastReviewedAt).toLocaleDateString()}</span>
          </div>
          <div className="p-4 flex-1 flex items-center gap-3">
            <span className="text-gray-500">FEEDBACK:</span>
            <a href={`mailto:${methodology.feedbackContact}`} className="text-black dark:text-white hover:underline">{methodology.feedbackContact}</a>
          </div>
        </div>

        {/* 5 PILARES */}
        <div>
          <h2 className="text-2xl font-serif italic tracking-tight text-black dark:text-white mb-8">
            Los 5 Pilares de la Calidad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(methodology.weights).map(([key, pillar], idx) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group cursor-default shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]"
              >
                <div className="p-6 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors">
                  <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center group-hover:border-white dark:group-hover:border-black">
                    {getPillarIcon(key)}
                  </div>
                  <span className="text-2xl font-black">{pillar.weightPercentage}%</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{pillar.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 dark:group-hover:text-gray-600 mb-6 leading-relaxed flex-1">
                    {pillar.description}
                  </p>
                  <div className="space-y-3 pt-6 border-t border-black dark:border-white group-hover:border-white dark:group-hover:border-black">
                    {pillar.criteria.map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-700 group-hover:text-gray-300 dark:text-gray-300 dark:group-hover:text-gray-700">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={2} />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BANDAS DE RECONOCIMIENTO */}
        <div>
          <h2 className="text-2xl font-serif italic tracking-tight text-black dark:text-white mb-8">
            Niveles de Reconocimiento
          </h2>
          <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
            {methodology.scoreBands.map((band, idx) => (
              <div key={idx} className={`p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 ${idx !== methodology.scoreBands.length - 1 ? 'border-b border-black dark:border-white' : ''} bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors`}>
                <div className="w-40 shrink-0 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest">
                  {band.bandName}
                </div>
                <div className="flex-1">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                    {band.minScore === 0 && band.maxScore === 0 
                      ? 'NO APLICA' 
                      : `${band.minScore} - ${band.maxScore} PUNTOS`}
                  </div>
                  <p className="text-black dark:text-white text-sm font-semibold">
                    {band.description}
                  </p>
                </div>
                {band.minScore >= 750 && (
                  <div className="hidden md:flex shrink-0">
                    <Award className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* NOTA DE TRANSPARENCIA */}
        <div className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black p-8 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col md:flex-row items-start gap-6">
          <div className="p-4 border border-white dark:border-black shrink-0">
            <Award className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">
              Transparencia en Resultados Patrocinados
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 leading-relaxed">
              EL QUSCORE ES UN ALGORITMO ESTRICTAMENTE ORGÁNICO Y ÉTICO. CUALQUIER CLÍNICA O ESPECIALISTA QUE INVIERTA EN PROMOCIÓN APARECERÁ MARCADO CON LA ETIQUETA "PATROCINADO" DE FORMA INDEPENDIENTE. <br/><br/>
              <span className="text-white dark:text-black border-b border-white dark:border-black">NINGÚN PAGO O PATROCINIO PUEDE ALTERAR LA CALIFICACIÓN DEL QUSCORE NI INFLUIR EN EL RANKING ORGÁNICO DE RESULTADOS.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
