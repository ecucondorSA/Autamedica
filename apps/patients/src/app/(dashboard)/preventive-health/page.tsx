'use client';

import { useState } from 'react';
import { Heart, Calculator, Clock, ListChecks } from 'lucide-react';
import { PersonalizedScreeningCalculator } from '@/components/preventive/PersonalizedScreeningCalculator';
import { ScreeningTimeline } from '@/components/preventive/ScreeningTimeline';
import { usePatientSession } from '@/hooks/usePatientSession';
import { computeAgeFromIso, normalizeGender } from '@/lib/demographics';

type TabId = 'calculator' | 'timeline' | 'education';

export default function PreventiveHealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator');
  const { profile, patient } = usePatientSession();
  const birthDate = (patient as any)?.birth_date || (profile as any)?.birthDate || null;
  const age = computeAgeFromIso(birthDate) ?? 30;
  const gender: 'male' | 'female' = normalizeGender(((patient as any)?.gender || (profile as any)?.gender) ?? null) ?? 'male';

  const tabs = [
    { id: 'calculator' as TabId, label: 'Calculadora', icon: Calculator },
    { id: 'timeline' as TabId, label: 'Cronología', icon: Clock },
    { id: 'education' as TabId, label: 'Educación', icon: ListChecks },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Salud Preventiva</h1>
          <p className="text-stone-600">Cuida tu salud con chequeos preventivos personalizados</p>
        </div>
      </div>

      {/* Guía: completar datos si faltan */}
      {(!computeAgeFromIso(birthDate) || normalizeGender(((patient as any)?.gender || (profile as any)?.gender) ?? null) == null) && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-900 font-medium">
            Para personalizar al máximo tus chequeos, completá tu {computeAgeFromIso(birthDate) ? '' : 'fecha de nacimiento'}{(!computeAgeFromIso(birthDate) && normalizeGender(((patient as any)?.gender || (profile as any)?.gender) ?? null) == null) ? ' y ' : ''}{normalizeGender(((patient as any)?.gender || (profile as any)?.gender) ?? null) == null ? 'género' : ''} en tu perfil.
          </p>
          <a
            href="/profile"
            className="mt-2 inline-block rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-900"
          >
            ✏️ Completar mi perfil
          </a>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <ListChecks className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Chequeos Completados</p>
              <p className="text-2xl font-bold text-stone-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Pendientes</p>
              <p className="text-2xl font-bold text-stone-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Próximo Chequeo</p>
              <p className="text-sm font-semibold text-stone-900">No programado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-stone-200">
        <div className="border-b border-stone-200">
          <div className="flex gap-1 p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'calculator' && (
            <PersonalizedScreeningCalculator defaultAge={age} defaultGender={gender} />
          )}
          {activeTab === 'timeline' && (
            <ScreeningTimeline currentAge={age} gender={gender} />
          )}
          {activeTab === 'education' && (
            <div className="text-center py-12">
              <ListChecks className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Contenido Educativo
              </h3>
              <p className="text-stone-600">
                Aquí encontrarás información sobre prevención y cuidado de la salud
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
