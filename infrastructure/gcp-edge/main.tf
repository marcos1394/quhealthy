provider "google" {
  project = var.project_id
  region  = var.region
}

# Estos data sources documentan y validan la infraestructura ya creada sin
# tomar su administración ni aplicar cambios sobre ella.
data "google_compute_global_address" "api" {
  name = "quhealthy-api-ip"
}

data "google_compute_url_map" "api" {
  name = "url-map-quhealthy"
}

data "google_compute_target_https_proxy" "api" {
  name = "quhealthy-api-https-proxy"
}

data "google_compute_managed_ssl_certificate" "api" {
  name = "cert-api-quhealthy-v3"
}

output "api_ip" {
  description = "IP global que Cloudflare deberá usar cuando el balanceador esté protegido y listo."
  value       = data.google_compute_global_address.api.address
}

output "api_domain" {
  value = var.api_domain
}

output "edge_resources" {
  description = "Recursos existentes que deben importarse antes de pasar su operación completa a Terraform."
  value = {
    url_map     = data.google_compute_url_map.api.name
    https_proxy = data.google_compute_target_https_proxy.api.name
    certificate = data.google_compute_managed_ssl_certificate.api.name
  }
}
