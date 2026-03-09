import { QhSpinner } from "@/components/ui/QhSpinner";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
            <QhSpinner size="lg" />

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
