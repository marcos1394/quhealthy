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
    serviceId: number;
    serviceName: string;
    quantity: number; // Créditos restantes (los que aún puede usar)
    totalQuantity: number; // Créditos iniciales (los que compró)
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