export type UserRole = "paciente" | "profesional";
export type DocumentStatus = "verified" | "pending" | "rejected";

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: DocumentStatus;
  downloadUrl: string;
  description?: string;
  thumbnailUrl?: string;
}