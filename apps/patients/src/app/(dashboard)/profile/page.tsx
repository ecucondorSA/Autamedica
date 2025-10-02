'use client';

import { User, Mail, Phone, Calendar, MapPin, Edit } from 'lucide-react';

export default function ProfilePage() {
  // Mock patient data - will be replaced with real data from Supabase
  const patient = {
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+54 9 11 1234-5678',
    date_of_birth: '1985-03-15',
    gender: 'female',
    address: 'Av. Corrientes 1234, CABA',
    medical_history_summary: 'Hipertensión controlada desde 2022',
    allergies: ['Penicilina', 'Mariscos'],
    emergency_contact: {
      name: 'Juan González',
      relationship: 'Esposo',
      phone: '+54 9 11 9876-5432',
    },
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="heading-1 flex items-center gap-3">
            <User className="h-8 w-8 text-stone-700" />
            Mi Perfil
          </h1>
          <button className="btn-primary-ivory px-6 py-3 text-sm inline-flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar perfil
          </button>
        </div>
        <p className="text-stone-600">
          Información personal y configuración de tu cuenta
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="card-ivory-elevated p-8">
          <h2 className="heading-2 mb-6">Información Personal</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-stone-600 mb-2 block">Nombre Completo</label>
              <p className="text-body font-semibold text-stone-900">
                {patient.first_name} {patient.last_name}
              </p>
            </div>

            <div>
              <label className="text-label text-stone-600 mb-2 block">Edad</label>
              <p className="text-body font-semibold text-stone-900">
                {calculateAge(patient.date_of_birth)} años
              </p>
            </div>

            <div>
              <label className="text-label text-stone-600 mb-2 block">Fecha de Nacimiento</label>
              <div className="flex items-center gap-2 text-body text-stone-900">
                <Calendar className="h-4 w-4 text-stone-500" />
                {new Date(patient.date_of_birth).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div>
              <label className="text-label text-stone-600 mb-2 block">Género</label>
              <p className="text-body text-stone-900">
                {patient.gender === 'female' ? 'Femenino' : patient.gender === 'male' ? 'Masculino' : 'Otro'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card-ivory p-8">
          <h2 className="heading-2 mb-6">Información de Contacto</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-stone-500" />
              <div>
                <label className="text-label text-stone-600 block">Email</label>
                <p className="text-body text-stone-900">{patient.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-stone-500" />
              <div>
                <label className="text-label text-stone-600 block">Teléfono</label>
                <p className="text-body text-stone-900">{patient.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-stone-500" />
              <div>
                <label className="text-label text-stone-600 block">Dirección</label>
                <p className="text-body text-stone-900">{patient.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card-ivory p-8">
          <h2 className="heading-2 mb-6">Información Médica</h2>

          <div className="space-y-4">
            <div>
              <label className="text-label text-stone-600 mb-2 block">Resumen Clínico</label>
              <p className="text-body text-stone-900">{patient.medical_history_summary}</p>
            </div>

            <div>
              <label className="text-label text-stone-600 mb-2 block">Alergias</label>
              <div className="flex gap-2">
                {patient.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-3 py-1 bg-red-50 text-red-700 border-2 border-red-300 rounded-full text-sm font-semibold"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card-ivory p-8">
          <h2 className="heading-2 mb-6">Contacto de Emergencia</h2>

          <div className="space-y-4">
            <div>
              <label className="text-label text-stone-600 block">Nombre</label>
              <p className="text-body text-stone-900">{patient.emergency_contact.name}</p>
            </div>
            <div>
              <label className="text-label text-stone-600 block">Relación</label>
              <p className="text-body text-stone-900">{patient.emergency_contact.relationship}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-stone-500" />
              <div>
                <label className="text-label text-stone-600 block">Teléfono</label>
                <p className="text-body text-stone-900">{patient.emergency_contact.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
