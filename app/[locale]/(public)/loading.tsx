import { QhSpinner } from "@/components/ui/QhSpinner";

export default function Loading() {
 return (
 <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-all duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <QhSpinner size="lg" />

 {/* Loading text (Editorial Style) */}
 <div className="mt-12 space-y-3 text-center z-10">
 <h3 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest animate-pulse">
 Iniciando Sistema
 </h3>
 <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] font-serif italic">
 QuHealthy.
 </p>
 </div>

 {/* Skeleton Page Layout Mockup (Architectural Grid) */}
 <div className="absolute bottom-0 left-0 w-full h-[30vh] overflow-hidden opacity-30 dark:opacity-20 pointer-events-none flex flex-col px-8 pb-8">
 <div className="w-full max-w-7xl mx-auto flex border-t border-l border-gray-200 dark:border-gray-800">
 <div className="h-64 flex-1 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] animate-pulse"></div>
 <div className="h-64 flex-1 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] animate-pulse delay-75"></div>
 <div className="h-64 flex-1 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] animate-pulse delay-150"></div>
 </div>
 </div>
 </div>
 );
}