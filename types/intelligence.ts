export interface ExecutiveSummaryDTO {
  totalEstablishments: number;
  privateEstablishments: number;
  primaryCareEstablishments: number;
  georeferencedEstablishments: number;
}

export interface DistributionDTO {
  label: string;
  total: number;
}

export interface HealthcareMapDTO {
  clues: string;
  entidad: string;
  municipio: string;
  localidad: string;
  nombreUnidad: string;
  nombreInstitucion: string;
  nivelAtencion: string;
  nombreTipoEstablecimiento: string;
  latitud: number;
  longitud: number;
}
