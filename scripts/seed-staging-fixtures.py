#!/usr/bin/env python3
"""
Seed Staging Fixtures (Iteración 2.4 - Mandato Fundadores)
Ambiente: Supabase rguiwyhfikoeelrviogh / GCP quhealthy-staging
Cero datos reales, cero cobros, cero comunicaciones externas.
"""
import os
import sys
import secrets
import string
import subprocess
import re
import json
import psycopg2
import bcrypt

def get_secret(name):
    # Primero intentar variable de entorno directa
    env_val = os.environ.get(name.upper().replace("-", "_"))
    if env_val:
        return env_val
    # Luego intentar gcloud
    try:
        cmd = ["gcloud", "secrets", "versions", "access", "latest", f"--secret={name}", "--project=quhealthy-staging"]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return res.stdout.decode("utf-8").strip()
    except Exception as e:
        return None

def generate_secure_password(length=24):
    chars = string.ascii_letters + string.digits + "!@#%^&*()-_"
    return "".join(secrets.choice(chars) for _ in range(length))

def hash_password(plain_pw):
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(plain_pw.encode("utf-8"), salt).decode("utf-8")

def set_or_create_secret(name, value):
    try:
        cmd_desc = ["gcloud", "secrets", "describe", name, "--project=quhealthy-staging"]
        res = subprocess.run(cmd_desc, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            cmd_create = ["gcloud", "secrets", "create", name, "--replication-policy=automatic", "--project=quhealthy-staging"]
            subprocess.run(cmd_create, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        cmd_ver = ["gcloud", "secrets", "versions", "add", name, "--data-file=-", "--project=quhealthy-staging"]
        subprocess.run(cmd_ver, input=value.encode("utf-8"), stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception as e:
        print(f"⚠️ Alerta guardando secreto {name}: {e}")

def main():
    print("🏥 [1/5] Obteniendo credenciales de conexión a Supabase Staging...")
    db_user = get_secret("staging-db-user") or os.environ.get("STAGING_DB_USER", "postgres.rguiwyhfikoeelrviogh")
    db_pass = get_secret("staging-db-password") or os.environ.get("STAGING_DB_PASSWORD")
    jdbc_url = get_secret("staging-db-jdbc-url") or os.environ.get("STAGING_DB_JDBC_URL")

    if not db_pass or not jdbc_url:
        print("❌ Error: Se requiere la contraseña y JDBC URL de Supabase staging.")
        print("   Proporcione STAGING_DB_PASSWORD o autentique gcloud con 'gcloud auth login'.")
        sys.exit(1)

    match = re.search(r"postgresql://([^:/]+):?(\d+)?/([^?]+)", jdbc_url)
    if not match:
        print(f"❌ Error parseando JDBC URL: {jdbc_url}")
        sys.exit(1)

    host = match.group(1)
    port = match.group(2) or "5432"
    dbname = match.group(3)

    print(f"🔌 Conectando a Supabase ({host}:{port}/{dbname}) con usuario {db_user}...")
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=db_user, password=db_pass)
    conn.autocommit = True
    cur = conn.cursor()

    print("🔐 [2/5] Gestionando credenciales de prueba en Secret Manager...")
    doctor_email = "staging.doctor.test@quhealthy.org"
    patient_email = "staging.patient.test@quhealthy.org"
    turnstile_token = "1x00000000000000000000AA"

    doctor_pw = get_secret("staging-test-doctor-password") or os.environ.get("STAGING_TEST_DOCTOR_PASSWORD")
    if not doctor_pw:
        doctor_pw = generate_secure_password()
        set_or_create_secret("staging-test-doctor-password", doctor_pw)
    doctor_pw_hash = hash_password(doctor_pw)

    patient_pw = get_secret("staging-test-patient-password") or os.environ.get("STAGING_TEST_PATIENT_PASSWORD")
    if not patient_pw:
        patient_pw = generate_secure_password()
        set_or_create_secret("staging-test-patient-password", patient_pw)
    patient_pw_hash = hash_password(patient_pw)

    set_or_create_secret("staging-test-doctor-email", doctor_email)
    set_or_create_secret("staging-test-patient-email", patient_email)
    set_or_create_secret("staging-turnstile-test-token", turnstile_token)

    print("👨‍⚕️ [3/5] Aprovisionando Médico Sintético y Entidades Clínicas...")
    # 0. Upsert Plan
    cur.execute("""
        INSERT INTO plans (
            id, name, description, price, transaction_fee, commission_rate,
            marketing_level, support_level, user_management,
            currency, duration, code, is_active, is_default, created_at, updated_at
        ) VALUES (
            1, 'Plan Profesional Staging', 'Plan sintético para compuerta clínica en staging', 0.00, 0.00, 0.00,
            1, 1, 1,
            'MXN', 'MONTHLY', 'PRO_STAGING', true, true, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            is_active = true, is_default = true;
    """)

    # 1. Upsert Provider
    cur.execute("""
        INSERT INTO providers (
            email, password, first_name, last_name, role, status, phone,
            is_email_verified, is_phone_verified, is_two_factor_enabled, terms_accepted,
            marketing_emails_opt_in,
            onboarding_complete, is_onboarding_completed, has_active_plan, plan_id,
            email_notifications_enabled, sms_notifications_enabled,
            appointment_reminders_enabled, push_notifications_enabled,
            slug, business_name, created_at, updated_at
        ) VALUES (
            %s, %s, 'Doctora Sintética', 'Staging', 'PROVIDER', 'ACTIVE', '+525500000001',
            true, true, false, true,
            false,
            true, true, true, 1,
            false, false,
            false, false,
            'dra-sintetica-staging', 'Consultorio Médico Staging', NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            status = 'ACTIVE',
            is_two_factor_enabled = false,
            onboarding_complete = true,
            is_onboarding_completed = true,
            has_active_plan = true,
            plan_id = 1,
            email_notifications_enabled = false,
            sms_notifications_enabled = false,
            appointment_reminders_enabled = false,
            push_notifications_enabled = false,
            updated_at = NOW()
        RETURNING id;
    """, (doctor_email, doctor_pw_hash))
    provider_id = cur.fetchone()[0]

    # 2. Upsert Provider Onboarding con Cédula Aprobada (Validación NOM-004)
    cur.execute("""
        INSERT INTO provider_onboarding (
            provider_id, email, first_name, last_name,
            kyc_status, license_status, onboarding_status, profile_status, fiscal_status,
            professional_title, specialty_license, degree_institution,
            professional_licenses, slug, business_name,
            created_at, updated_at
        ) VALUES (
            %s, %s, 'Doctora Sintética', 'Staging',
            'APPROVED', 'APPROVED', 'APPROVED', 'APPROVED', 'APPROVED',
            'Médico Cirujano', '12345678', 'Universidad Nacional Autónoma de México',
            %s, 'dra-sintetica-staging', 'Consultorio Médico Staging',
            NOW(), NOW()
        )
        ON CONFLICT (provider_id) DO UPDATE SET
            kyc_status = 'APPROVED',
            license_status = 'APPROVED',
            onboarding_status = 'APPROVED',
            profile_status = 'APPROVED',
            fiscal_status = 'APPROVED',
            specialty_license = '12345678',
            professional_licenses = EXCLUDED.professional_licenses,
            updated_at = NOW();
    """, (
        provider_id,
        doctor_email,
        json.dumps([{"number": "12345678", "institution": "UNAM", "status": "APPROVED", "type": "MEDICINA_GENERAL"}])
    ))

    # 3. Upsert Provider Documents (Cédula Profesional Aprobada)
    cur.execute("""
        DELETE FROM provider_documents WHERE provider_id = %s AND document_type = 'PROFESSIONAL_LICENSE';
    """, (provider_id,))
    cur.execute("""
        INSERT INTO provider_documents (
            provider_id, document_type, verification_status, file_key,
            extracted_data, verified_at, created_at, updated_at
        ) VALUES (
            %s, 'PROFESSIONAL_LICENSE', 'APPROVED', 'staging/licenses/synthetic_license_12345678.pdf',
            %s, NOW(), NOW(), NOW()
        ) RETURNING id;
    """, (
        provider_id,
        json.dumps({"license_number": "12345678", "institution": "UNAM", "status": "APPROVED"})
    ))
    doc_id = cur.fetchone()[0]

    # 4. Upsert Provider Locations (Sede Clínica Principal)
    cur.execute("""
        SELECT id FROM provider_locations WHERE provider_id = %s AND is_main = true LIMIT 1;
    """, (provider_id,))
    loc_row = cur.fetchone()
    if loc_row:
        location_id = loc_row[0]
        cur.execute("""
            UPDATE provider_locations
            SET is_active = true, name = 'Sede Sanitaria Staging',
                address = 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX'
            WHERE id = %s;
        """, (location_id,))
    else:
        cur.execute("""
            INSERT INTO provider_locations (
                provider_id, name, address, is_active, is_main
            ) VALUES (
                %s, 'Sede Sanitaria Staging',
                'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
                true, true
            ) RETURNING id;
        """, (provider_id,))
        location_id = cur.fetchone()[0]

    # 5. Upsert Catalog Items (Servicio Sintético con Precio $0.00 MXN para Cero Cobros)
    cur.execute("""
        SELECT id FROM catalog_items WHERE provider_id = %s AND name = 'Consulta de Medicina General Staging' LIMIT 1;
    """, (provider_id,))
    cat_row = cur.fetchone()
    if cat_row:
        service_id = cat_row[0]
        cur.execute("""
            UPDATE catalog_items
            SET price = 0.00, status = 'ACTIVE', duration_minutes = 30, modality = 'ONLINE', accepts_bnpl = false, updated_at = NOW()
            WHERE id = %s;
        """, (service_id,))
    else:
        cur.execute("""
            INSERT INTO catalog_items (
                provider_id, name, type, category, price, currency,
                duration_minutes, modality, status, description,
                accepts_bnpl, created_at, updated_at
            ) VALUES (
                %s, 'Consulta de Medicina General Staging', 'SERVICE', 'Medicina General',
                0.00, 'MXN', 30, 'ONLINE', 'ACTIVE',
                'Consulta médica sintética para compuerta clínica en staging',
                false, NOW(), NOW()
            ) RETURNING id;
        """, (provider_id,))
        service_id = cur.fetchone()[0]

    # 6. Upsert Provider Schedules (7 días a la semana de 08:00 a 20:00)
    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    cur.execute("""
        DELETE FROM provider_schedules WHERE provider_id = %s;
    """, (provider_id,))
    for d in days:
        cur.execute("""
            INSERT INTO provider_schedules (
                provider_id, location_id, day_of_week,
                start_time, end_time, is_working_day
            ) VALUES (
                %s, %s, %s,
                '08:00:00', '20:00:00', true
            );
        """, (provider_id, location_id, d))

    print("🧑‍🦱 [4/5] Aprovisionando Paciente Sintético...")
    # 7. Upsert Consumer
    cur.execute("""
        INSERT INTO consumers (
            email, password, first_name, last_name, role, status, phone,
            is_email_verified, is_phone_verified, is_two_factor_enabled, terms_accepted,
            marketing_emails_opt_in,
            email_notifications_enabled, sms_notifications_enabled,
            appointment_reminders_enabled, created_at, updated_at
        ) VALUES (
            %s, %s, 'Paciente Sintético', 'Staging', 'CONSUMER', 'ACTIVE', '+525500000002',
            true, true, false, true,
            false,
            false, false,
            false, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            status = 'ACTIVE',
            is_two_factor_enabled = false,
            email_notifications_enabled = false,
            sms_notifications_enabled = false,
            appointment_reminders_enabled = false,
            updated_at = NOW()
        RETURNING id;
    """, (patient_email, patient_pw_hash))
    consumer_id = cur.fetchone()[0]

    cur.close()
    conn.close()

    print("\n✅ [5/5] Fixtures sintéticos aprovisionados exitosamente:")
    print(f"   - Provider ID: {provider_id} ({doctor_email})")
    print(f"   - Sede Clínica ID: {location_id} (Sede Sanitaria Staging)")
    print(f"   - Cédula Documento ID: {doc_id} (12345678 - APPROVED)")
    print(f"   - Servicio ID: {service_id} (Consulta de Medicina General Staging - $0.00 MXN)")
    print(f"   - Agenda: {len(days)} días configurados (08:00 - 20:00)")
    print(f"   - Consumer ID: {consumer_id} ({patient_email})")
    print("   - Aislamiento garantizado: notificaciones desactivadas, precio $0.00, dominios sintéticos.")

if __name__ == "__main__":
    main()
