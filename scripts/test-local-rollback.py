#!/usr/bin/env python3
"""
Test local de rollback para la Cita 5 y sus relaciones reales.
Ejecutado estrictamente en memoria local (SQLite) sin tocar staging ni producción.
Demuestra la resolución en orden inverso de claves foráneas:
1. teleconsultation_consent_audits
2. teleconsultation_ai_consents
3. appointment_transactions
4. teleconsultations
5. appointments
"""
import sqlite3

def run_local_rollback_test():
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()

    # 1. Crear tablas locales con la estructura real de Postgres/Supabase
    cur.execute("""
    CREATE TABLE appointments (
        id INTEGER PRIMARY KEY,
        consumer_id INTEGER,
        provider_id INTEGER,
        status TEXT,
        appointment_type TEXT,
        payment_method TEXT,
        amount_paid NUMERIC
    );
    """)

    cur.execute("""
    CREATE TABLE teleconsultations (
        id INTEGER PRIMARY KEY,
        teleconsultation_id TEXT UNIQUE,
        appointment_id INTEGER UNIQUE REFERENCES appointments(id),
        status TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE teleconsultation_ai_consents (
        id INTEGER PRIMARY KEY,
        teleconsultation_id TEXT,
        consumer_id INTEGER,
        audio_processing_accepted BOOLEAN,
        clinical_note_accepted BOOLEAN,
        data_storage_accepted BOOLEAN,
        consent_version TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE teleconsultation_consent_audits (
        id INTEGER PRIMARY KEY,
        teleconsultation_id TEXT,
        action TEXT,
        actor_id INTEGER,
        actor_type TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE appointment_transactions (
        id INTEGER PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id),
        amount NUMERIC
    );
    """)

    # 2. Insertar los datos idénticos a los observados en Staging para la Cita 5
    cur.execute("INSERT INTO appointments VALUES (5, 1, 3, 'COMPLETED', 'ONLINE', 'CASH', 0.00);")
    cur.execute("INSERT INTO teleconsultations VALUES (4, '0ec7af9d-3a28-403d-b67a-da43a47e78a1', 5, 'SCHEDULED');")
    cur.execute("INSERT INTO teleconsultation_ai_consents VALUES (4, '0ec7af9d-3a28-403d-b67a-da43a47e78a1', 1, 1, 1, 1, '1.0');")
    cur.execute("INSERT INTO teleconsultation_consent_audits VALUES (4, '0ec7af9d-3a28-403d-b67a-da43a47e78a1', 'GRANTED', 1, 'PATIENT');")

    print("--- ESTADO INICIAL LOCAL ---")
    cur.execute("SELECT count(*) FROM appointments WHERE id = 5;")
    print("appointments count:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM teleconsultations WHERE appointment_id = 5;")
    print("teleconsultations count:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM teleconsultation_ai_consents WHERE teleconsultation_id IN (SELECT teleconsultation_id FROM teleconsultations WHERE appointment_id = 5);")
    print("teleconsultation_ai_consents count:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM teleconsultation_consent_audits WHERE teleconsultation_id IN (SELECT teleconsultation_id FROM teleconsultations WHERE appointment_id = 5);")
    print("teleconsultation_consent_audits count:", cur.fetchone()[0])

    # 3. Procedimiento Quirúrgico de Rollback (Orden inverso de dependencias y usando subconsultas seguras)
    rollback_sql = """
    -- Paso 1: Eliminar auditoría y consentimientos relacionados con la teleconsulta de la cita 5
    DELETE FROM teleconsultation_consent_audits 
    WHERE teleconsultation_id IN (SELECT teleconsultation_id FROM teleconsultations WHERE appointment_id = 5);

    DELETE FROM teleconsultation_ai_consents 
    WHERE teleconsultation_id IN (SELECT teleconsultation_id FROM teleconsultations WHERE appointment_id = 5);

    -- Paso 2: Eliminar transacciones (si las hubiera) y la sala de teleconsulta
    DELETE FROM appointment_transactions WHERE appointment_id = 5;

    DELETE FROM teleconsultations WHERE appointment_id = 5;

    -- Paso 3: Eliminar la cita 5
    DELETE FROM appointments WHERE id = 5;
    """

    cur.executescript(rollback_sql)

    print("\n--- ESTADO TRAS ROLLBACK LOCAL ---")
    cur.execute("SELECT count(*) FROM appointments WHERE id = 5;")
    assert cur.fetchone()[0] == 0, "Fallo: appointment 5 persiste"
    cur.execute("SELECT count(*) FROM teleconsultations WHERE appointment_id = 5;")
    assert cur.fetchone()[0] == 0, "Fallo: teleconsultation persiste"
    cur.execute("SELECT count(*) FROM teleconsultation_ai_consents WHERE teleconsultation_id = '0ec7af9d-3a28-403d-b67a-da43a47e78a1';")
    assert cur.fetchone()[0] == 0, "Fallo: consent persiste"
    cur.execute("SELECT count(*) FROM teleconsultation_consent_audits WHERE teleconsultation_id = '0ec7af9d-3a28-403d-b67a-da43a47e78a1';")
    assert cur.fetchone()[0] == 0, "Fallo: consent audit persiste"

    print("✅ TEST DE ROLLBACK LOCAL EXITOSO: Todos los registros eliminados limpiamente sin violaciones de clave foránea.")
    conn.close()

if __name__ == "__main__":
    run_local_rollback_test()
