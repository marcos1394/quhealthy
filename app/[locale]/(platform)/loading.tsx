import { Loader2, Activity } from "lucide-react";

export default function PlatformLoading() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Central animated loader */}
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-20 h-20 rounded-full border-4 border-medical-500/20 dark:border-medical-400/20 border-t-medical-600 dark:border-t-medical-500 animate-spin"></div>
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 z-10">
                    <Activity className="w-6 h-6 text-medical-600 dark:text-medical-400 animate-pulse" />
                </div>
            </div>

            {/* Text */}
            <div className="text-center mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cargando tu espacio...</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Preparando datos de salud en QuHealthy Platform.</p>
            </div>

            {/* Dashboard Skeleton */}
            <div className="w-full max-w-5xl px-4 md:px-8 mt-4 pointer-events-none">

                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse delay-75"></div>
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse flex flex-col justify-between">
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-8 w-16 bg-medical-100 dark:bg-medical-900/30 rounded"></div>
                    </div>
                    <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse delay-75 flex flex-col justify-between">
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-8 w-16 bg-medical-100 dark:bg-medical-900/30 rounded"></div>
                    </div>
                    <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse delay-150 flex flex-col justify-between">
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-8 w-16 bg-medical-100 dark:bg-medical-900/30 rounded"></div>
                    </div>
                </div>

                {/* Content Area Skeleton */}
                <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-pulse delay-300">
                    <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-16 w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800"></div>
                        <div className="h-16 w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800"></div>
                        <div className="h-16 w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
