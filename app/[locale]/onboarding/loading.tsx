import { QhSpinner } from "@/components/ui/QhSpinner";

export default function OnboardingLoading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md transition-all duration-300">
            <QhSpinner size="lg" />
            <div className="mt-8 space-y-2 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Preparando tu onboarding...</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">QuHealthy</p>
            </div>
        </div>
    );
}
