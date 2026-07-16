// hooks/useProviderRole.ts
"use client";

import { useSessionStore } from '@/stores/SessionStore';

/**
 * Módulos del dashboard que el staff puede tener habilitados.
 * Estos valores deben coincidir con los que el backend guarda en el JWT (permissions[]).
 */
export type StaffModule =
  | 'APPOINTMENTS'    // Citas
  | 'CALENDAR'        // Calendario
  | 'PATIENTS'        // Pacientes
  | 'MESSAGES'        // Mensajes CRM
  | 'ORDERS'          // Órdenes de servicio
  | 'CASH_REGISTER'   // Caja
  | 'BILLING'         // Facturación
  | 'INVENTORY'       // Inventario
  | 'PUBLIC_PROFILE'  // Perfil Público
  | 'ALL';            // Acceso total (equivalente a PROVIDER)

/**
 * Hook centralizado para lógica de roles en el dashboard del proveedor.
 *
 * Uso:
 *   const { isStaff, canAccess, effectiveProviderId } = useProviderRole();
 *   if (!canAccess('APPOINTMENTS')) return <AccessDenied />;
 */
export function useProviderRole() {
  const { role, user } = useSessionStore();

  const isStaff = role === 'ROLE_STAFF';
  const isProvider = role === 'ROLE_PROVIDER';
  const isProviderSide = isStaff || isProvider;

  /**
   * El providerId efectivo para queries al backend:
   * - PROVIDER → su propio ID
   * - STAFF    → el parentProviderId del JWT (proveedor al que pertenece)
   */
  const effectiveProviderId = isStaff
    ? (user?.parentProviderId ?? null)
    : (user?.id ?? null);

  /**
   * Permissions del staff (lista de módulos habilitados por el proveedor).
   * Para ROLE_PROVIDER siempre retorna true (acceso total).
   */
  const permissions: StaffModule[] = (user?.permissions as StaffModule[]) ?? [];

  /**
   * Verifica si el usuario actual tiene acceso a un módulo específico.
   * - PROVIDER  → siempre true
   * - STAFF     → solo si el módulo está en su lista de permissions
   */
  const canAccess = (module: StaffModule): boolean => {
    if (isProvider) return true;
    if (!isStaff) return false;
    return permissions.includes('ALL') || permissions.includes(module);
  };

  /**
   * Etiqueta del rol para mostrar en la UI.
   * Ej: "Recepcionista", "Enfermera", "Asistente"
   */
  const staffRoleLabel: Record<string, string> = {
    RECEPTIONIST: 'Recepcionista',
    NURSE: 'Enfermera',
    ASSISTANT: 'Asistente',
    COORDINATOR: 'Coordinadora',
    ADMIN_STAFF: 'Administrativa',
  };

  const roleLabel = isStaff
    ? (staffRoleLabel[user?.staffRole ?? ''] ?? 'Personal del consultorio')
    : isProvider
    ? 'Especialista'
    : '';

  return {
    isStaff,
    isProvider,
    isProviderSide,
    effectiveProviderId,
    permissions,
    canAccess,
    roleLabel,
  };
}
