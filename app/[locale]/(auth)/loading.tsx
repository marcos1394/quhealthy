import { QhSpinner } from "@/components/ui/QhSpinner";

export default function AuthLoading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md transition-all duration-300">
            <QhSpinner size="lg" />
            <div className="mt-8 space-y-2 text-center">
                <h3 className="text-xl font-medium text-black dark:text-white tracking-tight">Verificando...</h3>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 uppercase tracking-widest">QuHealthy</p>
            </div>
        </div>
    );
}
