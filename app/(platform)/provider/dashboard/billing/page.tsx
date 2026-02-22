import { Suspense } from "react";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { Building2, ReceiptText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Facturación y Pagos | QuHealthy",
  description: "Configura tu cuenta para recibir pagos y administra tus recibos.",
};

// Componente de carga para el Suspense
function StripeConnectCardSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 shadow-xl animate-pulse">
      <div className="flex items-center space-x-6">
        <div className="h-16 w-16 rounded-2xl bg-gray-800" />
        <div className="space-y-3 flex-1">
          <div className="h-5 w-64 rounded-lg bg-gray-800" />
          <div className="h-4 w-96 rounded-lg bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header de la Página */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <Building2 className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Facturación y Pagos
              </h1>
              <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Gestión Financiera
              </Badge>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
            Administra cómo recibes el dinero de tus consultas y mantén al día tu información financiera
          </p>
        </div>

        <div className="space-y-10">
          
          {/* SECCIÓN 1: Cuenta Conectada */}
          <section>
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-gray-800/50">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Building2 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Datos de Depósito
                </h2>
                <p className="text-sm text-gray-500">
                  Vincula tu cuenta bancaria para recibir pagos
                </p>
              </div>
            </div>
            
            {/* 🚀 Suspense es OBLIGATORIO porque StripeConnectCard usa useSearchParams */}
            <Suspense fallback={<StripeConnectCardSkeleton />}>
              <StripeConnectCard />
            </Suspense>
          </section>

          {/* SECCIÓN 2: Historial (Placeholder) */}
          <section className="opacity-60 hover:opacity-100 transition-all duration-300">
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-gray-800/50">
              <div className="p-2 bg-gray-800 rounded-xl border border-gray-700">
                <ReceiptText className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Historial de Recibos
                </h2>
                <p className="text-sm text-gray-500">
                  Consulta tus transacciones y transferencias
                </p>
              </div>
            </div>
            
            <div className="rounded-3xl border-2 border-dashed border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-16 text-center">
              <div className="mx-auto max-w-md space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700">
                  <ReceiptText className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-base font-semibold text-gray-400 leading-relaxed">
                  Una vez que comiences a recibir citas pagadas, tus recibos y transferencias aparecerán aquí
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}