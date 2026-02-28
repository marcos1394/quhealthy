import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
            <div className="relative flex items-center justify-center">
                {/* Outer glowing ring */}
                <div className="absolute w-24 h-24 rounded-full border-4 border-medical-500/20 dark:border-medical-400/20 border-t-medical-600 dark:border-t-medical-500 animate-spin"></div>

                {/* Inner solid ring */}
                <div className="absolute w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-b-medical-500 dark:border-b-medical-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

                {/* Core animated logo placeholder */}
                <div className="w-10 h-10 bg-gradient-to-tr from-medical-600 to-teal-400 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(13,148,136,0.3)]">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
            </div>

            {/* Loading text */}
            <div className="mt-8 space-y-2 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cargando...</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">QuHealthy Platform</p>
            </div>

            {/* Skeleton Page Layout Mockup below */}
            <div className="absolute bottom-0 left-0 w-full h-[30vh] overflow-hidden opacity-20 pointer-events-none flex flex-col gap-4 px-8 pb-8">
                <div className="w-full max-w-7xl mx-auto flex gap-4">
                    <div className="h-64 flex-1 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                    <div className="h-64 flex-1 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse delay-75"></div>
                    <div className="h-64 flex-1 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
}
