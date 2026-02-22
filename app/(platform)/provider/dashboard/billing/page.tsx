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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Facturación y Pagos
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Administra cómo recibes el dinero de tus consultas y mantén al día tu información fiscal.
        </p>
      </div>

      <div className="space-y-8">
        {/* SECCIÓN 1: Recibir Pagos (Stripe Connect) */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">
              Cuenta para Depósitos
            </h2>
          </div>
          
          <StripeConnectCard />
        </section>

        {/* SECCIÓN 2: Historial o Suscripción (Placeholder para el futuro) */}
        <section className="opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
            <ReceiptText className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">
              Historial de Recibos
            </h2>
          </div>
          
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">
              Una vez que comiences a recibir citas pagadas, tus recibos y facturas aparecerán aquí.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}