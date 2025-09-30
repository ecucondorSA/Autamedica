'use client';

import React, { useState } from 'react';

interface ProfileCompletionStepProps {
  bio: string;
  languages: string[];
  onUpdate: (bio: string, languages: string[]) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const AVAILABLE_LANGUAGES = [
  'Spanish',
  'English',
  'Portuguese',
  'Italian',
  'French',
  'German',
  'Chinese',
  'Arabic',
  'Russian',
  'Japanese',
  'Korean'
] as const;

export function ProfileCompletionStep({
  bio,
  languages,
  onUpdate,
  onComplete,
  onBack,
  isSubmitting
}: ProfileCompletionStepProps) {
  const [currentBio, setCurrentBio] = useState(bio);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(languages);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const updateBio = (newBio: string) => {
    setCurrentBio(newBio);
    onUpdate(newBio, selectedLanguages);
  };

  const toggleLanguage = (language: string) => {
    const updated = selectedLanguages.includes(language)
      ? selectedLanguages.filter(lang => lang !== language)
      : [...selectedLanguages, language];
    setSelectedLanguages(updated);
    onUpdate(currentBio, updated);
  };

  const bioCharacterCount = currentBio.length;
  const maxBioLength = 500;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Completa tu Perfil Profesional
        </h3>
        <p className="text-gray-600">
          Agrega una biografía profesional y los idiomas que hablas para completar tu perfil.
        </p>
      </div>

      {/* Biografía profesional */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Biografía Profesional
        </label>
        <textarea
          id="bio"
          value={currentBio}
          onChange={(e) => updateBio(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia médica, áreas de interés, filosofía de atención al paciente..."
          rows={6}
          maxLength={maxBioLength}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Una buena biografía ayuda a los pacientes a conocerte y generar confianza
          </p>
          <span className={`text-xs ${bioCharacterCount > maxBioLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
            {bioCharacterCount}/{maxBioLength}
          </span>
        </div>
      </div>

      {/* Idiomas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idiomas que Hablas
        </label>

        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {selectedLanguages.length > 0
                  ? `${selectedLanguages.length} idioma${selectedLanguages.length > 1 ? 's' : ''} seleccionado${selectedLanguages.length > 1 ? 's' : ''}`
                  : 'Seleccionar idiomas...'
                }
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showLanguageDropdown && (
            <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-lg p-2 bg-white shadow-lg max-h-48 overflow-y-auto">
              {AVAILABLE_LANGUAGES.map(language => (
                <label key={language} className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(language)}
                    onChange={() => toggleLanguage(language)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{language}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedLanguages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedLanguages.map(language => (
              <span
                key={language}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {language}
                <button
                  onClick={() => toggleLanguage(language)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Los pacientes pueden filtrar médicos por idioma disponible
        </p>
      </div>

      {/* Preview del perfil */}
      {(currentBio || selectedLanguages.length > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa del Perfil</h4>

          {currentBio && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">{currentBio}</p>
            </div>
          )}

          {selectedLanguages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Idiomas:</p>
              <div className="flex flex-wrap gap-1">
                {selectedLanguages.map(language => (
                  <span
                    key={language}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-700"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de finalización */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-800 text-sm">
              <strong>¡Casi terminamos!</strong> Al completar este paso, tu perfil médico estará listo
              y podrás comenzar a recibir pacientes en AutaMedica.
            </p>
            <p className="text-green-700 text-sm mt-1">
              Podrás editar toda esta información desde tu dashboard en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          Atrás
        </button>

        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creando perfil...
            </>
          ) : (
            'Completar Perfil Médico'
          )}
        </button>
      </div>
    </div>
  );
}