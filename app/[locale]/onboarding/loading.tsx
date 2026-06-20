import { QhSpinner } from "@/components/ui/QhSpinner";

export default function OnboardingLoading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-all duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
            <QhSpinner size="lg" />
            
            {/* Loading text (Editorial Style) */}
            <div className="mt-12 space-y-3 text-center z-10">
                <h3 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest animate-pulse">
                    Preparando Entorno
                </h3>
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] font-serif italic">
                    QuHealthy.
                </p>
            </div>
        </div>
    );
}