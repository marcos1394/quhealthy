// types/staff.ts

// Enums exactos de tu Backend Java
export type StaffRoleBackend = 'LEAD' | 'SPECIALIST' | 'ASSISTANT' | 'PROFESSIONAL';
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

// DTO para las peticiones Axios
export interface StaffDTO {
  id?: number;
  providerId?: number;
  name: string;
  specialty?: string;
  credentials?: string;
  email?: string;
  phone?: string;
  bio?: string;
  imageUrl?: string;
  role: StaffRoleBackend;
  averageRating?: number;
  reviewCount?: number;
  status?: StaffStatus;
  baseSalary?: number;
  commissionPercentage?: number;
  assignedServices?: {
    catalogItemId: number;
    locationId: number;
    catalogItemName: string;
    commissionPercentage?: number;
    fixedFee?: number;
  }[];
}

// Interfaz para el Componente UI (StaffManager.tsx)
export interface UI_StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  role: 'lead' | 'specialist' | 'assistant' | 'professional'; // El componente usa minúsculas
  credentials?: string;
  email?: string;
  baseSalary?: number;
  commissionPercentage?: number;
  assignedServices?: {
    catalogItemId: number;
    locationId: number;
    commissionPercentage?: number;
  }[];
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}