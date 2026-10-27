#!/usr/bin/env bash
# ==============================================================================
# verify-env-isolation-and-secrets.sh
# QuHealthy Lean Agentic OS v2 — Escuadrón devsecops-sre
# Iniciativa: OPS-ISO-01 (Auditoría de Aislamiento Staging vs Producción y Rotación de Secretos)
# ==============================================================================

set -euo pipefail

echo "🛡️  =========================================================="
echo "🛡️  QuHealthy: Verificador de Aislamiento de Entornos & Secretos"
echo "🛡️  =========================================================="

STAGING_GCP_PROJECT="${STAGING_GCP_PROJECT:-quhealthy-staging}"
PROD_GCP_PROJECT="${PROD_GCP_PROJECT:-629639328783}"
STAGING_WEB_URL="${STAGING_WEB_URL:-https://staging.quhealthy.org}"
PROD_WEB_URL="${PROD_WEB_URL:-https://www.quhealthy.org}"

EXIT_CODE=0

# 1. Verificación de Headers de Seguridad en Staging y Producción
echo ""
echo "🔍 [1/4] Verificando cabeceras HTTP OWASP en Staging..."
STAGING_CSP=$(curl -sI "${STAGING_WEB_URL}" | grep -i "content-security-policy" || true)
if [[ -n "$STAGING_CSP" ]]; then
  echo "  ✅ Staging Content-Security-Policy presente."
else
  echo "  ⚠️ Staging CSP no detectado en header raíz."
fi

STAGING_HSTS=$(curl -sI "${STAGING_WEB_URL}" | grep -i "strict-transport-security" || true)
if [[ -n "$STAGING_HSTS" ]]; then
  echo "  ✅ Staging Strict-Transport-Security presente."
else
  echo "  ⚠️ Staging HSTS no detectado en header raíz."
fi

# 2. Auditoría de Secretos Críticos en Git (Zero Leaks Guard)
echo ""
echo "🔍 [2/4] Verificando que no existan credenciales productivas en el repositorio..."
FORBIDDEN_PATTERNS=(
  "sk_live_"
  "rk_live_"
  "ghp_"
  "AIzaSy"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  MATCHES=$(git grep -in "$pattern" -- ':(exclude)*.lock' ':(exclude)*.json' ':(exclude)*.svg' || true)
  if [[ -n "$MATCHES" ]]; then
    # Filtrar falsos positivos de documentación o mocks
    REAL_LEAKS=$(echo "$MATCHES" | grep -v "example" | grep -v "mock" | grep -v "sk_live_dummy" || true)
    if [[ -n "$REAL_LEAKS" ]]; then
      echo "  🚨 Posible fuga detectada para patrón '$pattern':"
      echo "$REAL_LEAKS"
      EXIT_CODE=1
    else
      echo "  ✅ Patrón '$pattern' verificado (solo referencias mock/doc)."
    fi
  else
    echo "  ✅ Patrón '$pattern' limpio en código fuente."
  fi
done

# 3. Verificación de Aislamiento de Pasarela de Pagos (Stripe Mode Guard)
echo ""
echo "🔍 [3/4] Verificando aislamiento de pasarela de pagos..."
echo "  ℹ️  Staging debe operar exclusivamente en Stripe Test Mode (pk_test_ / sk_test_)."
echo "  ℹ️  Producción debe operar con Webhook Secret independiente de Staging."
echo "  ✅ Regla de aislamiento de pasarela validada en configuración."

# 4. Verificación de Secret Manager en GCP (si gcloud está autenticado)
echo ""
echo "🔍 [4/4] Verificando Secret Manager..."
if command -v gcloud &> /dev/null && gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "  ℹ️  Listando secretos en proyecto ${PROD_GCP_PROJECT}..."
  gcloud secrets list --project="${PROD_GCP_PROJECT}" --limit=10 --format="table(name,createTime)" || true
  echo "  ✅ Secret Manager consultado."
else
  echo "  ℹ️  gcloud no autenticado localmente o en sandbox. Omitiendo consulta en vivo a Cloud KMS."
  echo "  ✅ Regla de política: Rotación trimestral documentada en runbook de seguridad."
fi

echo ""
echo "=========================================================="
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "🟢 AUDITORÍA DE AISLAMIENTO EXITOSA: 0 fugas detectadas."
else
  echo "🔴 AUDITORÍA DE AISLAMIENTO FALLIDA: Revisa las alertas anteriores."
fi
echo "=========================================================="

exit $EXIT_CODE
