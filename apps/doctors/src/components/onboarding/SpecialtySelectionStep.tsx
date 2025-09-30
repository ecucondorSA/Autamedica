'use client';

import React, { useState } from 'react';

interface SpecialtySelectionStepProps {
  specialty: string;
  subspecialty?: string;
  yearsExperience: number;
  onUpdate: (specialty: string, subspecialty?: string, yearsExperience?: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const MEDICAL_SPECIALTIES = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Geriatría',
  'Ginecología y Obstetricia',
  'Hematología',
  'Medicina Interna',
  'Neumología',
  'Neurología',
  'Oftalmología',
  'Oncología',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Radiología',
  'Reumatología',
  'Urología',
  'Medicina Familiar',
  'Medicina de Emergencias',
  'Anestesiología',
  'Cirugía General',
  'Medicina del Deporte',
  'Medicina Preventiva'
] as const;

const SUBSPECIALTIES: Record<string, string[]> = {
  'Cardiología': [
    'Cardiología Intervencionista',
    'Electrofisiología',
    'Insuficiencia Cardíaca',
    'Cardiopatías Congénitas'
  ],
  'Dermatología': [
    'Dermatología Pediátrica',
    'Dermatología Oncológica',
    'Dermatología Estética',
    'Dermatopatología'
  ],
  'Ginecología y Obstetricia': [
    'Medicina Materno-Fetal',
    'Oncología Ginecológica',
    'Endocrinología Reproductiva',
    'Ginecología Infantojuvenil'
  ],
  'Medicina Interna': [
    'Medicina Intensiva',
    'Medicina Geriátrica',
    'Medicina Hospitalaria',
    'Medicina Ambulatoria'
  ],
  'Neurología': [
    'Neurología Pediátrica',
    'Epileptología',
    'Enfermedades Neuromusculares',
    'Cefaleas y Dolor'
  ],
  'Pediatría': [
    'Neonatología',
    'Pediatría Intensiva',
    'Gastroenterología Pediátrica',
    'Cardiología Pediátrica',
    'Neurología Pediátrica'
  ],
  'Psiquiatría': [
    'Psiquiatría Infantojuvenil',
    'Psicogeriatría',
    'Psiquiatría de Enlace',
    'Adicciones'
  ],
  'Cirugía General': [
    'Cirugía Laparoscópica',
    'Cirugía Bariátrica',
    'Cirugía de Mama',
    'Cirugía Colorrectal'
  ]
};

export function SpecialtySelectionStep({
  specialty,
  subspecialty,
  yearsExperience,
  onUpdate,
  onNext,
  onBack
}: SpecialtySelectionStepProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialty);
  const [selectedSubspecialty, setSelectedSubspecialty] = useState(subspecialty || '');
  const [experience, setExperience] = useState(yearsExperience);
  const [showSubspecialties, setShowSubspecialties] = useState(false);

  const availableSubspecialties = selectedSpecialty ? SUBSPECIALTIES[selectedSpecialty] || [] : [];

  const handleSpecialtyChange = (newSpecialty: string) => {
    setSelectedSpecialty(newSpecialty);
    setSelectedSubspecialty(''); // Reset subspecialty cuando cambia especialidad
    setShowSubspecialties(false);
    onUpdate(newSpecialty, '', experience);
  };

  const handleSubspecialtyChange = (newSubspecialty: string) => {
    setSelectedSubspecialty(newSubspecialty);
    onUpdate(selectedSpecialty, newSubspecialty, experience);
  };

  const handleExperienceChange = (newExperience: number) => {
    setExperience(newExperience);
    onUpdate(selectedSpecialty, selectedSubspecialty, newExperience);
  };

  const handleNext = () => {
    if (!selectedSpecialty) {
      alert('Por favor selecciona una especialidad médica');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Especialidad Médica
        </h3>
        <p className="text-gray-600">
          Selecciona tu especialidad principal y años de experiencia profesional.
        </p>
      </div>

      <div className="space-y-4">
        {/* Especialidad principal */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
            Especialidad Principal <span className="text-red-500">*</span>
          </label>
          <select
            id="specialty"
            value={selectedSpecialty}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona una especialidad</option>
            {MEDICAL_SPECIALTIES.map(spec => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Subspecialidad */}
        {selectedSpecialty && availableSubspecialties.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subspecialidad (Opcional)
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowSubspecialties(!showSubspecialties)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex justify-between items-center">
                  <span className={selectedSubspecialty ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedSubspecialty || 'Seleccionar subspecialidad...'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showSubspecialties ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showSubspecialties && (
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-40 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-white rounded cursor-pointer text-gray-600"
                    onClick={() => {
                      handleSubspecialtyChange('');
                      setShowSubspecialties(false);
                    }}
                  >
                    Sin subspecialidad
                  </div>
                  {availableSubspecialties.map(subspec => (
                    <div
                      key={subspec}
                      className="px-3 py-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => {
                        handleSubspecialtyChange(subspec);
                        setShowSubspecialties(false);
                      }}
                    >
                      {subspec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Años de experiencia */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
            Años de Experiencia Profesional <span className="text-red-500">*</span>
          </label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => handleExperienceChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>Recién graduado</option>
            <option value={1}>1 año</option>
            <option value={2}>2 años</option>
            <option value={3}>3 años</option>
            <option value={4}>4 años</option>
            <option value={5}>5 años</option>
            {Array.from({ length: 15 }, (_, i) => i + 6).map(year => (
              <option key={year} value={year}>
                {year} años
              </option>
            ))}
            <option value={21}>Más de 20 años</option>
          </select>
        </div>

        {/* Información adicional sobre especialidades */}
        {selectedSpecialty && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm">
                  <strong>Especialidad seleccionada:</strong> {selectedSpecialty}
                </p>
                {selectedSubspecialty && (
                  <p className="text-blue-700 text-sm mt-1">
                    <strong>Subspecialidad:</strong> {selectedSubspecialty}
                  </p>
                )}
                <p className="text-blue-700 text-sm mt-1">
                  Esta información aparecerá en tu perfil público y ayudará a los pacientes a encontrarte.
                </p>
              </div>
            </div>
          </div>
        )}
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
          onClick={handleNext}
          disabled={!selectedSpecialty}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}