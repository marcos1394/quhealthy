import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { Building2, ReceiptText } from "lucide-react";

export const metadata = {
  title: "Facturación y Pagos | QuHealthy",
  description: "Configura tu cuenta para recibir pagos y administra tus recibos.",
};

export default function BillingSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header de la Página */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Facturación y Pagos
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra cómo recibes el dinero de tus consultas y mantén al día tu información financiera.
        </p>
      </div>

      <div className="space-y-8">
        {/* SECCIÓN 1: Cuenta Conectada */}
        <section>
          <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="rounded-lg bg-sky-100 p-1.5 text-sky-600">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Datos de Depósito
            </h2>
          </div>
          
          <StripeConnectCard />
        </section>

        {/* SECCIÓN 2: Historial (Placeholder) */}
        <section className="opacity-60 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
              <ReceiptText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Historial de Recibos
            </h2>
          </div>
          
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Una vez que comiences a recibir citas pagadas, tus recibos y transferencias aparecerán aquí.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}