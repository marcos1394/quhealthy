#!/usr/bin/env python3
"""
Runner para la Compuerta E2E Clínica Autenticada en Staging
Recupera credenciales de forma segura desde GCP Secret Manager y ejecuta Playwright.
Cero contraseñas expuestas en stdout/logs.
"""
import os
import sys
import subprocess

def get_secret(name):
    env_val = os.environ.get(name.upper().replace("-", "_"))
    if env_val:
        return env_val
    try:
        cmd = ["gcloud", "secrets", "versions", "access", "latest", f"--secret={name}", "--project=quhealthy-staging"]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return res.stdout.decode("utf-8").strip()
    except Exception as e:
        print(f"⚠️ Error recuperando secreto {name}: {e}")
        return None

def main():
    print("🔐 [1/2] Extrayendo secretos de staging desde GCP Secret Manager...")
    doc_email = get_secret("staging-test-doctor-email")
    doc_pass = get_secret("staging-test-doctor-password")
    pat_email = get_secret("staging-test-patient-email")
    pat_pass = get_secret("staging-test-patient-password")
    turnstile_token = get_secret("staging-turnstile-test-token")

    if not doc_email or not doc_pass or not pat_email or not pat_pass:
        print("❌ Faltan credenciales requeridas en Secret Manager de staging.")
        sys.exit(1)

    print("   ✅ Credenciales de prueba cargadas correctamente (identidades sintéticas).")

    env = os.environ.copy()
    env["STAGING_TEST_DOCTOR_EMAIL"] = doc_email
    env["STAGING_TEST_DOCTOR_PASSWORD"] = doc_pass
    env["STAGING_TEST_PATIENT_EMAIL"] = pat_email
    env["STAGING_TEST_PATIENT_PASSWORD"] = pat_pass
    env["STAGING_TURNSTILE_TEST_TOKEN"] = turnstile_token or "XXXX.DUMMY.TOKEN.XXXX"

    # Eliminación de mutaciones automáticas: requiere autorización explícita por CLI o env var
    allow_mutations = os.environ.get("ALLOW_STAGING_MUTATIONS") == "true" or "--allow-mutations" in sys.argv
    env["ALLOW_STAGING_MUTATIONS"] = "true" if allow_mutations else "false"
    if allow_mutations:
        print("   ⚠️ Mutaciones sintéticas en staging EXPLÍCITAMENTE AUTORIZADAS por el operador.")
    else:
        print("   🛡️ Modo de salvaguarda activo: mutaciones desactivadas por defecto (pase --allow-mutations o ALLOW_STAGING_MUTATIONS=true para habilitar).")

    env["NEXT_PUBLIC_API_URL"] = os.environ.get("NEXT_PUBLIC_API_URL", "https://api-staging.quhealthy.org")
    env["STAGING_URL"] = os.environ.get("STAGING_URL", "https://staging.quhealthy.org")

    print("\n🚀 [2/2] Ejecutando Playwright E2E contra https://api-staging.quhealthy.org...")
    cmd = ["npx", "playwright", "test", "e2e/staging-authenticated-clinical-gate.spec.ts"]
    
    # Añadir flags adicionales pasados al runner (filtrando banderas internas)
    extra_args = [arg for arg in sys.argv[1:] if arg != "--allow-mutations"]
    if extra_args:
        cmd.extend(extra_args)

    res = subprocess.run(cmd, env=env)
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
