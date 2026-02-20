// types/staff.ts

// Enums exactos de tu Backend Java
export type StaffRoleBackend = 'LEAD' | 'SPECIALIST' | 'ASSISTANT';
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

// DTO para las peticiones Axios
export interface StaffDTO {
  id?: number;
  providerId?: number;
  name: string;
  specialty?: string;
  credentials?: string;
  bio?: string;
  imageUrl?: string;
  role: StaffRoleBackend;
  averageRating?: number;
  reviewCount?: number;
  status?: StaffStatus;
}

// Interfaz para el Componente UI (StaffManager.tsx)
export interface UI_StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  role: 'lead' | 'specialist' | 'assistant'; // El componente usa minúsculas
  credentials?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}