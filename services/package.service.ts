// src/services/package.service.ts
import axiosInstance from '@/lib/axios';
import { ConsumerPackage } from '@/types/packages';

const BASE_URL = '/api/appointments/consumer-packages';

/**
 * Servicio encargado de la gestión de la Billetera de Salud (Health Wallet)
 * y los paquetes de suscripción del paciente.
 */
export const packageService = {
    
    /**
     * 🎒 Obtiene la billetera completa del paciente autenticado.
     * Retorna los paquetes agrupados con sus créditos activos y agotados.
     */
    getMyPackages: async (): Promise<ConsumerPackage[]> => {
        const response = await axiosInstance.get<ConsumerPackage[]>(`${BASE_URL}/me`);
        return response.data;
    }
    
    // Aquí en el futuro puedes agregar métodos como:
    // getPackageHistory() -> Para ver los expirados
    // buyPackage(catalogItemId) -> Para integración con Stripe
};