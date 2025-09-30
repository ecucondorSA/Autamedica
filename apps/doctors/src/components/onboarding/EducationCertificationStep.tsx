'use client';

import React, { useState } from 'react';
import { DoctorEducation, MedicalCertification } from '@autamedica/types';

interface EducationCertificationStepProps {
  education: DoctorEducation[];
  certifications: MedicalCertification[];
  onUpdate: (education: DoctorEducation[], certifications: MedicalCertification[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EducationCertificationStep({
  education,
  certifications,
  onUpdate,
  onNext,
  onBack
}: EducationCertificationStepProps) {
  const [educationList, setEducationList] = useState<DoctorEducation[]>(education);
  const [certificationsList, setCertificationsList] = useState<MedicalCertification[]>(certifications);

  const addEducation = () => {
    const newEducation: DoctorEducation = {
      institution: '',
      degree: '',
      year: new Date().getFullYear(),
      specialization: ''
    };
    const updated = [...educationList, newEducation];
    setEducationList(updated);
    onUpdate(updated, certificationsList);
  };

  const updateEducation = (index: number, field: keyof DoctorEducation, value: string | number) => {
    const updated = educationList.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducationList(updated);
    onUpdate(updated, certificationsList);
  };

  const removeEducation = (index: number) => {
    const updated = educationList.filter((_, i) => i !== index);
    setEducationList(updated);
    onUpdate(updated, certificationsList);
  };

  const addCertification = () => {
    const newCertification: MedicalCertification = {
      name: '',
      issuer: '',
      date_issued: new Date().toISOString().split('T')[0],
      certificate_number: ''
    };
    const updated = [...certificationsList, newCertification];
    setCertificationsList(updated);
    onUpdate(educationList, updated);
  };

  const updateCertification = (index: number, field: keyof MedicalCertification, value: string) => {
    const updated = certificationsList.map((cert, i) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    setCertificationsList(updated);
    onUpdate(educationList, updated);
  };

  const removeCertification = (index: number) => {
    const updated = certificationsList.filter((_, i) => i !== index);
    setCertificationsList(updated);
    onUpdate(educationList, updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Educación y Certificaciones
        </h3>
        <p className="text-gray-600">
          Agrega tu formación académica y certificaciones profesionales para generar confianza en los pacientes.
        </p>
      </div>

      {/* Sección de Educación */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">Educación Médica</h4>
          <button
            onClick={addEducation}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Agregar
          </button>
        </div>

        {educationList.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institución
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  placeholder="Universidad de Buenos Aires"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título/Grado
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="Médico"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año de Graduación
                </label>
                <select
                  value={edu.year}
                  onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialización (Opcional)
                </label>
                <input
                  type="text"
                  value={edu.specialization || ''}
                  onChange={(e) => updateEducation(index, 'specialization', e.target.value)}
                  placeholder="Medicina Interna"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => removeEducation(index)}
              className="mt-2 text-red-600 text-sm hover:text-red-800"
            >
              Eliminar educación
            </button>
          </div>
        ))}

        {educationList.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No has agregado educación médica</p>
            <button
              onClick={addEducation}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Agregar tu primera educación
            </button>
          </div>
        )}
      </div>

      {/* Sección de Certificaciones */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">Certificaciones Profesionales</h4>
          <button
            onClick={addCertification}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Agregar
          </button>
        </div>

        {certificationsList.map((cert, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Certificación
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  placeholder="Certificación en Cardiología"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institución Emisora
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                  placeholder="Sociedad Argentina de Cardiología"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  value={cert.date_issued.split('T')[0]}
                  onChange={(e) => updateCertification(index, 'date_issued', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Certificado (Opcional)
                </label>
                <input
                  type="text"
                  value={cert.certificate_number || ''}
                  onChange={(e) => updateCertification(index, 'certificate_number', e.target.value)}
                  placeholder="CERT-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento (Opcional)
                </label>
                <input
                  type="date"
                  value={cert.expiry_date?.split('T')[0] || ''}
                  onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => removeCertification(index)}
              className="mt-2 text-red-600 text-sm hover:text-red-800"
            >
              Eliminar certificación
            </button>
          </div>
        ))}

        {certificationsList.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No has agregado certificaciones</p>
            <button
              onClick={addCertification}
              className="mt-2 text-green-600 hover:text-green-800"
            >
              Agregar tu primera certificación
            </button>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-800 text-sm">
            <strong>Tip:</strong> Agregar tu educación y certificaciones ayuda a generar confianza en los pacientes.
            Puedes saltar este paso y agregar esta información más tarde desde tu perfil.
          </p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Atrás
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}