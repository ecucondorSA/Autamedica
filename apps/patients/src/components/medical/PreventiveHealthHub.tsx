'use client';

import { useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Heart,
  Eye,
  Shield,
  Bell,
  Info
} from 'lucide-react';
import { usePreventiveScreenings } from '@/hooks/usePreventiveScreenings';
import type { ScreeningCategoryType } from '@autamedica/types';

interface PreventiveHealthHubProps {
  patientId: string;
}

type TabType = 'recommendations' | 'my-screenings' | 'reminders' | 'cases';

const CATEGORY_ICONS: Record<ScreeningCategoryType, React.ElementType> = {
  cancer_screening: Shield,
  cardiovascular: Heart,
  metabolic: Activity,
  immunization: Shield,
  vision_hearing: Eye,
  bone_health: Activity,
  mental_health: Heart,
  reproductive_health: Heart,
  dental: FileText
};

const CATEGORY_LABELS: Record<ScreeningCategoryType, string> = {
  cancer_screening: 'Cáncer',
  cardiovascular: 'Cardiovascular',
  metabolic: 'Metabólico',
  immunization: 'Vacunas',
  vision_hearing: 'Visión y Audición',
  bone_health: 'Salud Ósea',
  mental_health: 'Salud Mental',
  reproductive_health: 'Salud Reproductiva',
  dental: 'Dental'
};

const URGENCY_COLORS = {
  low: 'bg-amber-100 text-blue-800 border-amber-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300'
};

const STATUS_COLORS = {
  not_started: 'bg-stone-100 text-gray-800',
  scheduled: 'bg-amber-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  not_applicable: 'bg-stone-100 text-stone-600'
};

const STATUS_LABELS = {
  not_started: 'No iniciado',
  scheduled: 'Agendado',
  completed: 'Completado',
  overdue: 'Vencido',
  not_applicable: 'No aplica'
};

export function PreventiveHealthHub({ patientId }: PreventiveHealthHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [selectedCategory, setSelectedCategory] = useState<ScreeningCategoryType | 'all'>('all');

  const {
    myScreenings,
    recommendations,
    isLoading,
    isLoadingRecommendations,
    error,
    scheduleScreening,
    markAsCompleted,
    cancelScreening
  } = usePreventiveScreenings({ patientId });

  // Group recommendations by category
  const recommendationsByCategory = recommendations.reduce((acc, rec) => {
    const category = rec.screening.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(rec);
    return acc;
  }, {} as Record<ScreeningCategoryType, typeof recommendations>);

  // Filter recommendations
  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.screening.category === selectedCategory);

  // Calculate stats
  const totalRecommendations = recommendations.length;
  const urgentCount = recommendations.filter(r => r.urgency === 'high').length;
  const scheduledCount = myScreenings.filter(s => s.status === 'scheduled').length;
  const completedCount = myScreenings.filter(s => s.status === 'completed').length;

  return (
    <div className="w-full px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Salud Preventiva
        </h1>
        <p className="text-stone-600">
          Screenings médicos recomendados según tu edad y perfil de salud
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Recomendaciones</p>
              <p className="text-2xl font-bold text-stone-900">{totalRecommendations}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Agendados</p>
              <p className="text-2xl font-bold text-amber-600">{scheduledCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-stone-200 mb-6">
        <div className="border-b border-stone-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'recommendations'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-stone-600 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recomendaciones
              </div>
            </button>

            <button
              onClick={() => setActiveTab('my-screenings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-screenings'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-stone-600 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mis Screenings
                {scheduledCount > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {scheduledCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reminders'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-stone-600 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Recordatorios
              </div>
            </button>

            <button
              onClick={() => setActiveTab('cases')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cases'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-stone-600 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Casos Médicos
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Recommendations */}
          {activeTab === 'recommendations' && (
            <div>
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Filtrar por categoría
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Todas ({totalRecommendations})
                  </button>
                  {Object.entries(recommendationsByCategory).map(([category, recs]) => {
                    const Icon = CATEGORY_ICONS[category as ScreeningCategoryType];
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category as ScreeningCategoryType)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          selectedCategory === category
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {CATEGORY_LABELS[category as ScreeningCategoryType]} ({recs.length})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations List */}
              {isLoadingRecommendations ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-stone-600 mt-4">Cargando recomendaciones...</p>
                </div>
              ) : filteredRecommendations.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-stone-600">
                    ¡Excelente! No hay screenings pendientes en esta categoría.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations.map((rec) => {
                    const Icon = CATEGORY_ICONS[rec.screening.category];
                    return (
                      <div
                        key={rec.screening.id}
                        className={`border-2 rounded-lg p-4 ${URGENCY_COLORS[rec.urgency]}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="w-6 h-6" />
                              <h3 className="font-semibold text-lg">
                                {rec.screening.name}
                              </h3>
                              {rec.screening.is_mandatory && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  OBLIGATORIO
                                </span>
                              )}
                            </div>

                            <p className="text-sm mb-3">
                              {rec.screening.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-stone-600">Categoría</p>
                                <p className="font-medium">
                                  {CATEGORY_LABELS[rec.screening.category]}
                                </p>
                              </div>
                              <div>
                                <p className="text-stone-600">Frecuencia</p>
                                <p className="font-medium">
                                  {rec.screening.recommended_frequency.replace(/_/g, ' ')}
                                </p>
                              </div>
                              <div>
                                <p className="text-stone-600">Costo estimado</p>
                                <p className="font-medium">
                                  {rec.screening.estimated_cost_ars
                                    ? `$${rec.screening.estimated_cost_ars.toLocaleString('es-AR')} ARS`
                                    : 'Gratuito'}
                                </p>
                              </div>
                              <div>
                                <p className="text-stone-600">Salud pública</p>
                                <p className="font-medium">
                                  {rec.screening.covered_by_public_health ? '✅ Cubierto' : '❌ No cubierto'}
                                </p>
                              </div>
                            </div>

                            {rec.screening.preparation_instructions && (
                              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-current">
                                <p className="text-xs font-medium mb-1">📋 Preparación:</p>
                                <p className="text-sm">{rec.screening.preparation_instructions}</p>
                              </div>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-sm">
                              <Info className="w-4 h-4" />
                              <span className="font-medium">{rec.reason}</span>
                            </div>
                          </div>

                          <div className="ml-4">
                            <button
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 7); // Default: 1 semana
                                scheduleScreening(rec.screening.id, date);
                              }}
                              className="px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors shadow-sm"
                            >
                              Agendar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: My Screenings */}
          {activeTab === 'my-screenings' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-stone-600 mt-4">Cargando tus screenings...</p>
                </div>
              ) : myScreenings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-stone-500 mx-auto mb-4" />
                  <p className="text-stone-600">
                    No tienes screenings agendados todavía.
                  </p>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500"
                  >
                    Ver recomendaciones
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myScreenings.map((screening) => (
                    <div
                      key={screening.id}
                      className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {screening.screening.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                STATUS_COLORS[screening.status]
                              }`}
                            >
                              {STATUS_LABELS[screening.status]}
                            </span>
                          </div>

                          <p className="text-sm text-stone-600 mb-3">
                            {screening.screening.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            {screening.scheduled_date && (
                              <div>
                                <p className="text-stone-600">Fecha agendada</p>
                                <p className="font-medium">
                                  {new Date(screening.scheduled_date).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}

                            {screening.next_due_date && (
                              <div>
                                <p className="text-stone-600">Próxima fecha</p>
                                <p className="font-medium">
                                  {new Date(screening.next_due_date).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}

                            {screening.assigned_doctor && (
                              <div>
                                <p className="text-stone-600">Médico asignado</p>
                                <p className="font-medium">
                                  Dr. {screening.assigned_doctor.first_name}{' '}
                                  {screening.assigned_doctor.last_name}
                                </p>
                              </div>
                            )}
                          </div>

                          {screening.result_summary && (
                            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-xs font-medium text-green-700 mb-1">
                                📊 Resultado:
                              </p>
                              <p className="text-sm text-green-800">{screening.result_summary}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          {screening.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => markAsCompleted(screening.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                              >
                                Marcar completo
                              </button>
                              <button
                                onClick={() => cancelScreening(screening.id)}
                                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-300"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Reminders */}
          {activeTab === 'reminders' && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <p className="text-stone-600 mb-2">
                Sistema de recordatorios próximamente
              </p>
              <p className="text-sm text-stone-600">
                Recibirás notificaciones automáticas para tus screenings programados
              </p>
            </div>
          )}

          {/* Tab: Medical Cases */}
          {activeTab === 'cases' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <p className="text-stone-600 mb-2">
                Casos médicos educativos próximamente
              </p>
              <p className="text-sm text-stone-600">
                Artículos sobre prevención de enfermedades según tu perfil
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
