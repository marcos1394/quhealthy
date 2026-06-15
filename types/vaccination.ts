export interface VaccinationStatusDto {
    vaccineCatalogId: number;
    name: string;
    diseasePrevented: string;
    doseNumber: number;
    recommendedAgeMonths: number;
    notes: string;
    isApplied: boolean;
    appliedDate: string | null;
    appliedBy: string | null;
    isDelayed: boolean;
    recommendedDate: string | null;
}

export interface MarkVaccineRequest {
    vaccineCatalogId: number;
    appliedDate: string; // YYYY-MM-DD
    appliedBy?: string;
}
