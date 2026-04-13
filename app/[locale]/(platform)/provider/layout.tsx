// Ubicación: src/app/[locale]/(platform)/provider/layout.tsx

import React from "react";
import { ProviderGuard } from "@/components/guards/ProviderGuard";

export default function ProviderSpecificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Simplemente envolvemos a los hijos del provider con el Guard.
    // El layout padre (PlatformLayout) se encargará de pintar el Sidebar y el fondo.
    <ProviderGuard>
      {children}
    </ProviderGuard>
  );
}