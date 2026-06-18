import json

def update_pricing(filepath, is_en):
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    if "Pricing" not in data:
        data["Pricing"] = {}
    
    data["Pricing"]["plans"] = {
        "free": {
            "title": "Gratis" if not is_en else "Free",
            "description": "Empieza tu consultorio digital sin costo" if not is_en else "Start your digital practice at no cost",
            "features": [
                "$0 Mensualidad fija" if not is_en else "$0 Fixed monthly fee",
                "Gestión básica de Citas y Pacientes" if not is_en else "Basic Appointment and Patient Management",
                "15% de comisión por cobros en app" if not is_en else "15% commission on in-app payments"
            ],
            "button_text": "Comenzar gratis" if not is_en else "Start for free"
        },
        "basic": {
            "title": "Básico" if not is_en else "Basic",
            "description": "Ideal para consultorios en crecimiento" if not is_en else "Ideal for growing practices",
            "features": [
                "Hasta 50 Citas al mes" if not is_en else "Up to 50 Appointments per month",
                "Catálogo: 5 Servicios / 10 Productos" if not is_en else "Catalog: 5 Services / 10 Products",
                "15% Comisión + $10 por reserva" if not is_en else "15% Commission + $10 per booking"
            ],
            "button_text": "Elegir Básico" if not is_en else "Choose Basic"
        },
        "standard": {
            "title": "Estándar" if not is_en else "Standard",
            "description": "Para profesionales establecidos" if not is_en else "For established professionals",
            "features": [
                "Hasta 150 Citas al mes" if not is_en else "Up to 150 Appointments per month",
                "Catálogo: 15 Servicios / 30 Productos" if not is_en else "Catalog: 15 Services / 30 Products",
                "12% Comisión + $8 por reserva" if not is_en else "12% Commission + $8 per booking",
                "Acceso a ventas en QUMarket" if not is_en else "Access to sales in QUMarket"
            ],
            "button_text": "Prueba 14 días gratis" if not is_en else "Try 14 days for free"
        },
        "premium": {
            "title": "Premium" if not is_en else "Premium",
            "description": "Maximiza el potencial de tu clínica" if not is_en else "Maximize your clinic's potential",
            "features": [
                "Hasta 500 Citas al mes" if not is_en else "Up to 500 Appointments per month",
                "Catálogo: 50 Servicios / 100 Productos" if not is_en else "Catalog: 50 Services / 100 Products",
                "10% Comisión + $5 por reserva" if not is_en else "10% Commission + $5 per booking",
                "Reportes Avanzados e IA (QUBlocks)" if not is_en else "Advanced Reports & AI (QUBlocks)"
            ],
            "button_text": "Elegir Premium" if not is_en else "Choose Premium"
        },
        "enterprise": {
            "title": "Empresarial" if not is_en else "Enterprise",
            "description": "Para clínicas grandes y múltiples usuarios" if not is_en else "For large clinics and multiple users",
            "features": [
                "Citas y Catálogo Ilimitados" if not is_en else "Unlimited Appointments and Catalog",
                "Gestión Multi-usuario (Clínicas)" if not is_en else "Multi-user Management (Clinics)",
                "Comisión VIP: 5% + $0 por reserva" if not is_en else "VIP Commission: 5% + $0 per booking",
                "Marketing y Soporte Nivel 4 (VIP)" if not is_en else "Level 4 Marketing & Support (VIP)"
            ],
            "button_text": "Contactar ventas" if not is_en else "Contact sales"
        }
    }
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_pricing('messages/es.json', False)
update_pricing('messages/en.json', True)

print("Pricing translations updated.")
