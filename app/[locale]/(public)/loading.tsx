import { QhSpinner } from "@/components/ui/QhSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] backdrop-blur-md transition-all duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      
      {/* Container Central con tarjeta Glassmorphism */}
      <div className="relative z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center space-y-6 max-w-xs w-full mx-4">
        
        {/* Spinner Oficial QuHealthy */}
        <div className="relative flex items-center justify-center">
          <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Mensaje de Estado */}
        <div className="space-y-1.5 text-center">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider animate-pulse">
            Sintetizando Sistema
          </h3>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide font-mono">
            QuHealthy OS
          </p>
        </div>

      </div>

      {/* Modern Interface Skeleton Mockup en Fondo */}
      <div className="absolute bottom-0 inset-x-0 h-[35vh] overflow-hidden opacity-20 pointer-events-none px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-lg" />
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 animate-pulse delay-100 hidden md:block">
            <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-lg" />
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 animate-pulse delay-200 hidden md:block">
            <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-lg" />
          </div>
        </div>
      </div>

    </div>
  );
}