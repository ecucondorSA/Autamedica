#!/usr/bin/env python3
"""
Create patient account in Supabase
"""

import os
import sys
import json
from pathlib import Path

# Intentar importar supabase
try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase-py no está instalado")
    print("   Instalando...")
    os.system("pip3 install supabase --quiet")
    from supabase import create_client, Client


def load_env_vars():
    """Carga variables de entorno desde .env.local"""
    env_file = Path('/home/edu/Autamedica/apps/patients/.env.local')

    if not env_file.exists():
        print("❌ No se encontró .env.local")
        return None, None

    env_vars = {}
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value

    url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
    key = env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    return url, key


def create_patient_account(email: str, password: str, patient_data: dict):
    """Crea una cuenta de paciente en Supabase."""

    print("="*60)
    print("👤 CREATE PATIENT ACCOUNT")
    print("="*60)

    # Cargar credenciales
    url, key = load_env_vars()

    if not url or not key:
        print("❌ No se pudieron cargar las credenciales de Supabase")
        return False

    print(f"🔗 Conectando a Supabase: {url}")

    try:
        # Crear cliente
        supabase: Client = create_client(url, key)

        # 1. Crear usuario en auth
        print(f"\n1️⃣ Creando usuario auth: {email}")

        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "role": "patient",
                    "full_name": patient_data.get('full_name', ''),
                }
            }
        })

        if not auth_response.user:
            print("❌ Error al crear usuario auth")
            return False

        user_id = auth_response.user.id
        print(f"   ✅ Usuario creado: {user_id}")

        # 2. Crear perfil de paciente
        print(f"\n2️⃣ Creando perfil de paciente...")

        patient_profile = {
            "id": user_id,
            "email": email,
            "full_name": patient_data.get('full_name', ''),
            "phone": patient_data.get('phone', ''),
            "date_of_birth": patient_data.get('date_of_birth', None),
            "gender": patient_data.get('gender', None),
            "address": patient_data.get('address', ''),
            "emergency_contact_name": patient_data.get('emergency_contact_name', ''),
            "emergency_contact_phone": patient_data.get('emergency_contact_phone', ''),
            "blood_type": patient_data.get('blood_type', None),
            "allergies": patient_data.get('allergies', []),
            "medical_conditions": patient_data.get('medical_conditions', []),
            "medications": patient_data.get('medications', []),
            "role": "patient",
            "created_at": "now()",
            "updated_at": "now()"
        }

        # Intentar insertar en tabla patients (si existe)
        try:
            profile_response = supabase.table('patients').insert(patient_profile).execute()
            print(f"   ✅ Perfil creado en tabla 'patients'")
        except Exception as e:
            # Si no existe la tabla, intentar con profiles
            try:
                profile_response = supabase.table('profiles').insert(patient_profile).execute()
                print(f"   ✅ Perfil creado en tabla 'profiles'")
            except Exception as e2:
                print(f"   ⚠️  No se pudo crear perfil en base de datos: {str(e2)[:100]}")
                print(f"   ℹ️  Esto es normal si las tablas no existen aún")

        print("\n" + "="*60)
        print("✅ CUENTA CREADA EXITOSAMENTE")
        print("="*60)
        print(f"📧 Email: {email}")
        print(f"🆔 User ID: {user_id}")
        print(f"👤 Nombre: {patient_data.get('full_name', 'N/A')}")
        print(f"\n💡 Accede a: http://localhost:3003")

        # Guardar info en archivo
        output_file = Path('/home/edu/Autamedica/patient-account.json')
        with open(output_file, 'w') as f:
            json.dump({
                'email': email,
                'password': password,
                'user_id': user_id,
                'full_name': patient_data.get('full_name', ''),
                'created_at': str(auth_response.user.created_at)
            }, f, indent=2)

        print(f"\n📄 Detalles guardados en: {output_file}")

        return True

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False


def create_demo_patient():
    """Crea un paciente demo."""

    email = "paciente.demo@autamedica.com"
    password = "Demo1234!"

    patient_data = {
        "full_name": "Juan Pérez Demo",
        "phone": "+593 99 123 4567",
        "date_of_birth": "1990-05-15",
        "gender": "male",
        "address": "Av. Principal 123, Quito, Ecuador",
        "emergency_contact_name": "María Pérez",
        "emergency_contact_phone": "+593 99 765 4321",
        "blood_type": "O+",
        "allergies": ["penicilina"],
        "medical_conditions": [],
        "medications": []
    }

    return create_patient_account(email, password, patient_data)


def create_custom_patient():
    """Crea un paciente con datos personalizados."""

    print("="*60)
    print("📝 CREAR PACIENTE PERSONALIZADO")
    print("="*60)

    email = input("\n📧 Email: ").strip()
    if not email:
        email = "paciente@test.com"

    password = input("🔒 Password (min 8 chars): ").strip()
    if not password:
        password = "Test1234!"

    full_name = input("👤 Nombre completo: ").strip()
    if not full_name:
        full_name = "Paciente Test"

    phone = input("📱 Teléfono (opcional): ").strip()

    patient_data = {
        "full_name": full_name,
        "phone": phone,
        "date_of_birth": "1990-01-01",
        "gender": "other",
        "address": "",
        "emergency_contact_name": "",
        "emergency_contact_phone": "",
        "blood_type": None,
        "allergies": [],
        "medical_conditions": [],
        "medications": []
    }

    return create_patient_account(email, password, patient_data)


def main():
    """Main function."""

    if len(sys.argv) > 1 and sys.argv[1] == "custom":
        create_custom_patient()
    else:
        print("🎭 Creando paciente demo...")
        print("   (usa 'python3 create-patient-account.py custom' para personalizado)")
        print()
        create_demo_patient()


if __name__ == '__main__':
    main()
