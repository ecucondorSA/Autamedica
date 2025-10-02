'use client';

import { useState, useEffect } from 'react';
import { StoryCard } from '@/components/anamnesis/StoryCard';
import { AnamnesisField } from '@/components/anamnesis/AnamnesisField';
import { MediaEducativa } from '@/components/anamnesis/MediaEducativa';
import { PausaCognitiva } from '@/components/anamnesis/PausaCognitiva';
import { anamnesisSteps } from '@/data/anamnesis-steps';
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle, Play, Save } from 'lucide-react';
import { useAnamnesis } from '@/hooks';
import type { AnamnesisSection } from '@autamedica/types';

export default function AnamnesisPage() {
  // Hook de Supabase para anamnesis
  const {
    anamnesis,
    progress: _dbProgress,
    loading: _loading,
    error: _error,
    createAnamnesis,
    updateSection,
    refreshAnamnesis,
  } = useAnamnesis();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [anamnesisData, setAnamnesisData] = useState<Record<string, any>>({});
  const [started, setStarted] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [privacySetting, setPrivacySetting] = useState<'shared' | 'private'>('shared');

  const currentStep = anamnesisSteps[currentStepIndex];
  const progress = anamnesis?.completion_percentage ?? ((currentStepIndex + 1) / anamnesisSteps.length) * 100;

  // Auto-guardado cada 30 segundos
  useEffect(() => {
    if (!started) return;

    const autoSaveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 30000); // 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [anamnesisData, started]);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('anamnesis_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnamnesisData(parsed.data || {});
        setCurrentStepIndex(parsed.currentStep || 0);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  const saveToLocalStorage = async () => {
    setIsSaving(true);
    try {
      // Guardar en localStorage como respaldo
      localStorage.setItem(
        'anamnesis_draft',
        JSON.stringify({
          data: anamnesisData,
          currentStep: currentStepIndex,
          lastSaved: new Date().toISOString(),
        })
      );

      // Guardar en Supabase si hay anamnesis creada
      if (anamnesis && currentStep) {
        const sectionKey = currentStep.category as AnamnesisSection;
        await updateSection(sectionKey, anamnesisData);
      }

      setLastSaved(new Date());
    } catch (e) {
      console.error('Error saving:', e);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setAnamnesisData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const canGoNext = () => {
    // Verificar que todos los campos requeridos estén completos
    return currentStep.fields
      .filter((f) => f.required)
      .every((f) => {
        const value = anamnesisData[f.id];
        return value !== undefined && value !== '' && value !== null;
      });
  };

  const handleNext = () => {
    if (currentStepIndex < anamnesisSteps.length - 1) {
      // Pausas cognitivas cada 4 pasos
      if ((currentStepIndex + 1) % 4 === 0) {
        setShowPause(true);
      } else {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Auto-guardar al avanzar
      saveToLocalStorage();
    }
  };

  const handleContinueAfterPause = () => {
    setShowPause(false);
    setCurrentStepIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    try {
      setIsSaving(true);

      // Crear anamnesis en Supabase si no existe
      if (!anamnesis) {
        await createAnamnesis({
          status: 'completed',
          completion_percentage: 100,
          locked: false,
          privacy_accepted: privacySetting === 'shared',
          terms_accepted: true,
        });
      } else {
        // Actualizar última sección
        const sectionKey = currentStep.category as AnamnesisSection;
        await updateSection(sectionKey, anamnesisData);

        // Actualizar anamnesis como completada
        // TODO: Agregar método updateAnamnesis al hook
      }

      // Guardar final en localStorage como respaldo
      const finalData = {
        ...anamnesisData,
        privacy: privacySetting,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem('anamnesis_final', JSON.stringify(finalData));
      localStorage.removeItem('anamnesis_draft');

      alert(`¡Anamnesis completada exitosamente!\n\nConfiguración de privacidad: ${
        privacySetting === 'shared'
          ? 'Compartida con médicos de AutaMedica'
          : 'Privada - Solo para uso personal'
      }`);

      // Refresh para obtener datos actualizados
      await refreshAnamnesis();
    } catch (error) {
      console.error('Error al completar anamnesis:', error);
      alert('Hubo un error al guardar la anamnesis. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-ivory-base to-purple-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="card-ivory-elevated p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-stone-900 mb-4 text-center">
              Tu Historia Clínica
            </h1>

            <p className="text-xl text-stone-700 mb-8 text-center">
              Vamos a completar tu historia clínica, que es la base de todos los diagnósticos médicos
            </p>

            {/* Opciones de privacidad */}
            <div className="bg-stone-50 border-2 border-stone-300 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                🔒 Privacidad de tu Historia Clínica
              </h3>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  privacySetting === 'shared' ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="privacy"
                    value="shared"
                    checked={privacySetting === 'shared'}
                    onChange={(e) => setPrivacySetting(e.target.value as 'shared')}
                    className="mt-1 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-stone-900">Compartida con médicos de AutaMedica</p>
                    <p className="text-sm text-stone-600 mt-1">
                      Todos los médicos de la plataforma podrán acceder a tu historia clínica para brindarte mejor atención
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  privacySetting === 'private' ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacySetting === 'private'}
                    onChange={(e) => setPrivacySetting(e.target.value as 'private')}
                    className="mt-1 h-5 w-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-stone-900">Privada - Solo para uso personal</p>
                    <p className="text-sm text-stone-600 mt-1">
                      Tu historia clínica estará disponible solo para ti. Deberás compartirla manualmente con cada médico
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-amber-900">
                ⏱️ <strong>Tiempo estimado:</strong> 15-20 minutos<br />
                💾 <strong>Se guarda automáticamente</strong> - puedes pausar y volver cuando quieras
              </p>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="btn-primary-ivory px-8 py-4 text-lg inline-flex items-center gap-3 w-full justify-center"
            >
              <Play className="h-6 w-6" />
              Comenzar mi Historia Clínica
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-base">
      {/* Pausa Cognitiva Modal */}
      {showPause && (
        <PausaCognitiva stepNumber={currentStepIndex + 1} onContinue={handleContinueAfterPause} />
      )}

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-stone-200 shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Paso {currentStepIndex + 1} de {anamnesisSteps.length}
              </p>
              <p className="text-xs text-stone-600">{currentStep.category.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Indicador de guardado */}
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-xs text-blue-600">Guardando...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Save className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">
                      ✓ Guardado {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s atrás
                    </span>
                  </>
                ) : null}
              </div>
              <p className="text-sm font-bold text-stone-900">{Math.round(progress)}% completo</p>
            </div>
          </div>
          <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">
            {currentStep.title}
          </h1>
          <p className="text-xl text-stone-600">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Story Cards */}
        <StoryCard
          intro={currentStep.story.intro}
          why={currentStep.story.why}
          example={currentStep.story.example}
          didYouKnow={currentStep.story.didYouKnow}
        />

        {/* Media Educativa (Video/Imagen) */}
        {currentStep.mediaUrl && (
          <div className="mb-8">
            <MediaEducativa
              type="video"
              url={currentStep.mediaUrl}
              title={`Video educativo: ${currentStep.title}`}
              description="Aprende más sobre este tema con nuestro contenido visual"
              duration="3:45"
            />
          </div>
        )}

        {/* Formulario */}
        <div className="card-ivory-elevated p-8 mb-8">
          <h2 className="heading-2 mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Ahora cuéntanos sobre ti
          </h2>

          <div className="space-y-6">
            {currentStep.fields.map((field) => {
              // Check si el campo depende de otro
              if (field.dependsOn) {
                const dependsValue = anamnesisData[field.dependsOn.fieldId];
                if (dependsValue !== field.dependsOn.value) {
                  return null;
                }
              }

              return (
                <AnamnesisField
                  key={field.id}
                  field={field}
                  value={anamnesisData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all ${
              currentStepIndex === 0
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'btn-secondary-ivory'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            Anterior
          </button>

          <div className="text-center">
            <p className="text-sm text-stone-600">
              {currentStepIndex === anamnesisSteps.length - 1
                ? '¡Último paso!'
                : `Faltan ${anamnesisSteps.length - currentStepIndex - 1} pasos`}
            </p>
          </div>

          {currentStepIndex === anamnesisSteps.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={!canGoNext()}
              className={`px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all ${
                !canGoNext()
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'btn-primary-ivory'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              Finalizar
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={`px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all ${
                !canGoNext()
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'btn-primary-ivory'
              }`}
            >
              Siguiente
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
