import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Star, UserCheck, Activity, FileText, ArrowRight } from "lucide-react";
import { ProviderScoreResponse } from "@/types/providerScore";
import { useRouter } from "next/navigation";

interface QuScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: ProviderScoreResponse | null;
}

export const QuScoreModal: React.FC<QuScoreModalProps> = ({ isOpen, onClose, scoreData }) => {
  const router = useRouter();

  if (!scoreData) return null;

  const getPillarIcon = (key: string) => {
    switch (key) {
      case 'P1': return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
      case 'P2': return <Star className="w-5 h-5 text-amber-500" />;
      case 'P3': return <UserCheck className="w-5 h-5 text-emerald-500" />;
      case 'P4': return <Activity className="w-5 h-5 text-rose-500" />;
      case 'P5': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPTIMAL': return 'bg-emerald-500';
      case 'IMPROVABLE': return 'bg-amber-500';
      case 'LOW': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 p-6 text-white text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-inner">
                <span className="text-3xl font-black">{scoreData.score}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Desglose del QuScore</h2>
              <p className="text-purple-200 text-sm opacity-90">Transparencia algorítmica para tu tranquilidad</p>
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {scoreData.isNewProvider && (
                <div className="p-4 mb-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Este profesional es nuevo en QuHealthy. Aún no tiene suficientes consultas para calcular su score completo.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {Object.entries(scoreData.breakdown).map(([key, pillar]) => (
                  <div key={key} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 transition-all hover:border-slate-200 dark:hover:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                          {getPillarIcon(key)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pillar.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[200px] truncate">{pillar.tooltip}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">{pillar.percentage}%</span>
                    </div>
                    {/* Barra de Progreso */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pillar.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${getStatusColor(pillar.status)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={() => {
                  onClose();
                  router.push('/es/como-funciona-el-quscore');
                }}
                className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl transition-colors"
              >
                Conoce la metodología pública <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
