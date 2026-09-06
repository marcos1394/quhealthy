variable "project_id" {
  description = "ID del proyecto de GCP que aloja los servicios de QuHealthy."
  type        = string
  default     = "quhealthy-backend"
}

variable "region" {
  description = "Región de Cloud Run y Memorystore."
  type        = string
  default     = "us-central1"
}

variable "api_domain" {
  description = "Dominio público del API."
  type        = string
  default     = "api.quhealthy.org"
}

variable "enable_cloud_armor" {
  description = "Crea la política de Cloud Armor. Mantener false hasta que la cuota global Security policies sea al menos 1."
  type        = bool
  default     = false
}
