// src/types/packages.ts

export interface PackageProviderInfo {
    name: string;
    specialty: string;
}

export interface PackageServiceInfo {
    name: string;
    description: string;
}

export interface PackageCredit {
    serviceId: number; // 🚀 En BD ahora mapea a catalogItemId
    serviceName: string; // 🚀 En BD ahora mapea a itemNameSnapshot
    quantity: number; // Créditos restantes (los que aún puede usar)
    totalQuantity: number; // Créditos iniciales (los que compró)
    itemType?: 'SERVICE' | 'PRODUCT' | 'COURSE' | string; // 🚀 NUEVO: Para lógica híbrida en la UI
}

/**
 * Representa una "Billetera" o paquete comprado por un paciente.
 * Agrupa los créditos de múltiples servicios bajo un mismo paquete original.
 */
export interface ConsumerPackage {
    id: number; // Identificador del grupo (Basado en el ID del paquete original)
    provider: PackageProviderInfo;
    servicePackage: PackageServiceInfo;
    purchaseDate: string; // Formato ISO 8601
    creditsRemaining: PackageCredit[];
}