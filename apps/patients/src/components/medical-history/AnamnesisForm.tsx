'use client';

import { useState } from 'react';
import type {
  CreateMedicalConditionInput,
  CreateMedicalAllergyInput,
  ConditionStatus,
  AllergySeverity,
  FamilyRelationship
} from '@autamedica/types';

interface AnamnesisFormProps {
  onSubmit: (data: AnamnesisFormData) => void;
  className?: string;
}

interface AnamnesisFormData {
  personalHistory: {
    conditions: CreateMedicalConditionInput[];
    allergies: CreateMedicalAllergyInput[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      indication?: string;
    }[];
    surgeries: {
      name: string;
      date: string;
      complications?: string;
    }[];
  };
  familyHistory: CreateMedicalConditionInput[];
  socialHistory: {
    smoking: 'never' | 'former' | 'current';
    alcohol: 'never' | 'occasional' | 'regular' | 'excessive';
    exercise: 'sedentary' | 'light' | 'moderate' | 'intense';
    diet: 'poor' | 'fair' | 'good' | 'excellent';
    occupation: string;
    stress: 'low' | 'moderate' | 'high';
  };
  reviewOfSystems: {
    [system: string]: {
      symptoms: string[];
      notes?: string;
    };
  };
}

export function AnamnesisForm({ onSubmit, className = '' }: AnamnesisFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<AnamnesisFormData>({
    personalHistory: {
      conditions: [],
      allergies: [],
      medications: [],
      surgeries: []
    },
    familyHistory: [],
    socialHistory: {
      smoking: 'never',
      alcohol: 'never',
      exercise: 'sedentary',
      diet: 'fair',
      occupation: '',
      stress: 'moderate'
    },
    reviewOfSystems: {}
  });

  const sections = [
    { title: 'Historia Personal', icon: '🏥' },
    { title: 'Historia Familiar', icon: '👨‍👩‍👧‍👦' },
    { title: 'Historia Social', icon: '🌍' },
    { title: 'Revisión por Sistemas', icon: '🔍' },
    { title: 'Resumen', icon: '📋' }
  ];

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const addCondition = (type: 'personal' | 'family') => {
    const newCondition: CreateMedicalConditionInput = {
      patient_id: '' as any, // Will be set by parent
      name: '',
      status: 'active' as ConditionStatus,
      is_chronic: false,
      is_family_history: type === 'family',
      family_relationship: type === 'family' ? 'mother' as FamilyRelationship : undefined
    };

    if (type === 'personal') {
      setFormData(prev => ({
        ...prev,
        personalHistory: {
          ...prev.personalHistory,
          conditions: [...prev.personalHistory.conditions, newCondition]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        familyHistory: [...prev.familyHistory, newCondition]
      }));
    }
  };

  const addAllergy = () => {
    const newAllergy: CreateMedicalAllergyInput = {
      patient_id: '' as any, // Will be set by parent
      allergen: '',
      allergen_type: 'medication',
      severity: 'mild' as AllergySeverity
    };

    setFormData(prev => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        allergies: [...prev.personalHistory.allergies, newAllergy]
      }
    }));
  };

  const renderPersonalHistory = () => (
    <div className="space-y-6">
      {/* Medical Conditions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Condiciones Médicas</h3>
          <button
            onClick={() => addCondition('personal')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-3">
          {formData.personalHistory.conditions.map((condition, index) => (
            <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la condición"
                  value={condition.name}
                  onChange={(e) => {
                    const newConditions = [...formData.personalHistory.conditions];
                    newConditions[index].name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      personalHistory: { ...prev.personalHistory, conditions: newConditions }
                    }));
                  }}
                  className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                />

                <select
                  value={condition.status}
                  onChange={(e) => {
                    const newConditions = [...formData.personalHistory.conditions];
                    newConditions[index].status = e.target.value as ConditionStatus;
                    setFormData(prev => ({
                      ...prev,
                      personalHistory: { ...prev.personalHistory, conditions: newConditions }
                    }));
                  }}
                  className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
                >
                  <option value="active">Activa</option>
                  <option value="resolved">Resuelta</option>
                  <option value="chronic">Crónica</option>
                  <option value="under_treatment">En Tratamiento</option>
                </select>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={condition.is_chronic}
                    onChange={(e) => {
                      const newConditions = [...formData.personalHistory.conditions];
                      newConditions[index].is_chronic = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        personalHistory: { ...prev.personalHistory, conditions: newConditions }
                      }));
                    }}
                    className="rounded"
                  />
                  <label className="text-white text-sm">Crónica</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Alergias</h3>
          <button
            onClick={addAllergy}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-3">
          {formData.personalHistory.allergies.map((allergy, index) => (
            <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Alérgeno"
                  value={allergy.allergen}
                  onChange={(e) => {
                    const newAllergies = [...formData.personalHistory.allergies];
                    newAllergies[index].allergen = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      personalHistory: { ...prev.personalHistory, allergies: newAllergies }
                    }));
                  }}
                  className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                />

                <select
                  value={allergy.allergen_type}
                  onChange={(e) => {
                    const newAllergies = [...formData.personalHistory.allergies];
                    newAllergies[index].allergen_type = e.target.value as any;
                    setFormData(prev => ({
                      ...prev,
                      personalHistory: { ...prev.personalHistory, allergies: newAllergies }
                    }));
                  }}
                  className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
                >
                  <option value="medication">Medicamento</option>
                  <option value="food">Alimento</option>
                  <option value="environmental">Ambiental</option>
                  <option value="other">Otro</option>
                </select>

                <select
                  value={allergy.severity}
                  onChange={(e) => {
                    const newAllergies = [...formData.personalHistory.allergies];
                    newAllergies[index].severity = e.target.value as AllergySeverity;
                    setFormData(prev => ({
                      ...prev,
                      personalHistory: { ...prev.personalHistory, allergies: newAllergies }
                    }));
                  }}
                  className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
                >
                  <option value="mild">Leve</option>
                  <option value="moderate">Moderada</option>
                  <option value="severe">Severa</option>
                  <option value="life_threatening">Mortal</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFamilyHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Historia Familiar</h3>
        <button
          onClick={() => addCondition('family')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
        >
          + Agregar
        </button>
      </div>

      <div className="space-y-3">
        {formData.familyHistory.map((condition, index) => (
          <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Condición médica"
                value={condition.name}
                onChange={(e) => {
                  const newConditions = [...formData.familyHistory];
                  newConditions[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, familyHistory: newConditions }));
                }}
                className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/40"
              />

              <select
                value={condition.family_relationship || 'mother'}
                onChange={(e) => {
                  const newConditions = [...formData.familyHistory];
                  newConditions[index].family_relationship = e.target.value as FamilyRelationship;
                  setFormData(prev => ({ ...prev, familyHistory: newConditions }));
                }}
                className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
              >
                <option value="mother">Madre</option>
                <option value="father">Padre</option>
                <option value="sibling">Hermano/a</option>
                <option value="grandparent">Abuelo/a</option>
                <option value="aunt_uncle">Tío/a</option>
                <option value="cousin">Primo/a</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialHistory = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Tabaquismo</label>
          <select
            value={formData.socialHistory.smoking}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, smoking: e.target.value as any }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
          >
            <option value="never">Nunca</option>
            <option value="former">Ex-fumador</option>
            <option value="current">Fumador actual</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Alcohol</label>
          <select
            value={formData.socialHistory.alcohol}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, alcohol: e.target.value as any }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
          >
            <option value="never">Nunca</option>
            <option value="occasional">Ocasional</option>
            <option value="regular">Regular</option>
            <option value="excessive">Excesivo</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Ejercicio</label>
          <select
            value={formData.socialHistory.exercise}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, exercise: e.target.value as any }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
          >
            <option value="sedentary">Sedentario</option>
            <option value="light">Ligero</option>
            <option value="moderate">Moderado</option>
            <option value="intense">Intenso</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Dieta</label>
          <select
            value={formData.socialHistory.diet}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, diet: e.target.value as any }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
          >
            <option value="poor">Pobre</option>
            <option value="fair">Regular</option>
            <option value="good">Buena</option>
            <option value="excellent">Excelente</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Ocupación</label>
          <input
            type="text"
            value={formData.socialHistory.occupation}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, occupation: e.target.value }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/40"
            placeholder="Trabajo o profesión"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Nivel de Estrés</label>
          <select
            value={formData.socialHistory.stress}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialHistory: { ...prev.socialHistory, stress: e.target.value as any }
            }))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded text-white focus:outline-none focus:border-white/40"
          >
            <option value="low">Bajo</option>
            <option value="moderate">Moderado</option>
            <option value="high">Alto</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderReviewOfSystems = () => (
    <div className="space-y-6">
      <p className="text-white/70">
        Selecciona los síntomas que has experimentado recientemente:
      </p>

      {/* Systems review would be implemented here */}
      <div className="text-white/60 text-center py-8">
        <p>Revisión por sistemas - Funcionalidad por implementar</p>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Resumen de Anamnesis</h3>

      <div className="space-y-4">
        <div className="p-4 bg-black/20 rounded-lg border border-white/10">
          <h4 className="font-medium text-white mb-2">Condiciones Médicas: {formData.personalHistory.conditions.length}</h4>
          <h4 className="font-medium text-white mb-2">Alergias: {formData.personalHistory.allergies.length}</h4>
          <h4 className="font-medium text-white mb-2">Historia Familiar: {formData.familyHistory.length} condiciones</h4>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
      >
        Completar Anamnesis
      </button>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderPersonalHistory();
      case 1: return renderFamilyHistory();
      case 2: return renderSocialHistory();
      case 3: return renderReviewOfSystems();
      case 4: return renderSummary();
      default: return renderPersonalHistory();
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/60">
          <span>Progreso</span>
          <span>{currentSection + 1} de {sections.length}</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSection === index
                ? 'bg-white text-black'
                : index < currentSection
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/60'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.title}
          </button>
        ))}
      </div>

      {/* Current Section Content */}
      <div className="p-6 bg-black/20 rounded-lg border border-white/10 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-3 text-2xl">{sections[currentSection].icon}</span>
          {sections[currentSection].title}
        </h2>

        {renderCurrentSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevSection}
          disabled={currentSection === 0}
          className="px-6 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
        >
          Anterior
        </button>

        {currentSection < sections.length - 1 && (
          <button
            onClick={handleNextSection}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}