# La política se mantiene desactivada hasta que GCP otorgue la cuota global
# "Security policies". Las reglas empiezan en modo preview para observar su
# impacto antes de bloquear tráfico legítimo.
resource "google_compute_security_policy" "api_waf" {
  count       = var.enable_cloud_armor ? 1 : 0
  name        = "quhealthy-api-waf"
  description = "WAF de perímetro para api.quhealthy.org"

  rule {
    action   = "deny(403)"
    priority = 1000
    preview  = true

    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sqli-v33-stable', {'sensitivity': 2})"
      }
    }
    description = "Detecta intentos comunes de inyección SQL."
  }

  rule {
    action   = "deny(403)"
    priority = 1100
    preview  = true

    match {
      expr {
        expression = "evaluatePreconfiguredWaf('xss-v33-stable', {'sensitivity': 2})"
      }
    }
    description = "Detecta intentos comunes de XSS."
  }

  rule {
    action   = "allow"
    priority = 2147483647

    match {
      versioned_expr = "SRC_IPS_V1"

      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Regla predeterminada; las reglas WAF se aplicarán tras validar los logs."
  }

  lifecycle {
    prevent_destroy = true
  }
}

output "cloud_armor_policy_name" {
  value       = var.enable_cloud_armor ? google_compute_security_policy.api_waf[0].name : null
  description = "Nombre de la política cuando se habilite."
}
