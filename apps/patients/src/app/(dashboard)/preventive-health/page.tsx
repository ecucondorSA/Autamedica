'use client';

// Disable SSG for this page since it uses auth and client-side data fetching
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Heart, Calculator, Clock, ListChecks, Loader2 } from 'lucide-react';
import { PersonalizedScreeningCalculator } from '@/components/preventive/PersonalizedScreeningCalculator';
import { ScreeningTimeline } from '@/components/preventive/ScreeningTimeline';
import { createBrowserClient } from '@/lib/supabase';

type TabId = 'calculator' | 'timeline' | 'education';

export default function PreventiveHealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator');
  const [patientAge, setPatientAge] = useState<number | undefined>(undefined);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Get patient data
  useEffect(() => {
    const getPatientData = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Try to get patient profile from database
          const { data: patient } = await supabase
            .from('patients')
            .select('birth_date, gender')
            .eq('id', user.id)
            .single();

          if (patient) {
            // Calculate age from birth_date
            if (patient.birth_date) {
              const birthDate = new Date(patient.birth_date);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              setPatientAge(age);
            }

            // Set gender
            if (patient.gender) {
              setPatientGender(patient.gender as 'male' | 'female');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, []);

  const tabs = [
    {
      id: 'calculator' as TabId,
      label: 'Calculadora Personalizada',
      icon: Calculator,
      description: 'Descubrí qué estudios te corresponden'
    },
    {
      id: 'timeline' as TabId,
      label: 'Línea de Tiempo',
      icon: Clock,
      description: 'Controles por edad'
    },
    {
      id: 'education' as TabId,
      label: 'Material Educativo',
      icon: ListChecks,
      description: 'Información completa'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-stone-900 mx-auto" />
          <p className="mt-4 text-stone-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-base">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-rose-600" />
            Salud Preventiva
          </h1>
          <p className="text-stone-600 text-lg">
            Cuidá tu salud antes de que aparezcan los síntomas
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-stone-800 text-white shadow-lg'
                      : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className={`text-xs font-normal ${
                      activeTab === tab.id ? 'text-stone-300' : 'text-stone-500'
                    }`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'calculator' && (
            <PersonalizedScreeningCalculator
              defaultAge={patientAge}
              defaultGender={patientGender}
            />
          )}

          {activeTab === 'timeline' && (
            <ScreeningTimeline
              currentAge={patientAge}
              gender={patientGender}
            />
          )}

          {activeTab === 'education' && (
            <EducationalMaterial />
          )}
        </div>
      </div>
    </div>
  );
}

function EducationalMaterial() {
  return (
    <div className="bg-white rounded-xl border-2 border-stone-300 p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-stone-900 mb-6">
        ¿Por qué son importantes los chequeos de salud?
      </h2>

      {/* Introduction */}
      <div className="prose prose-stone max-w-none mb-8">
        <p className="text-lg text-stone-700 leading-relaxed">
          <strong>Cuidar tu salud antes de que aparezcan los síntomas es la mejor inversión que podés hacer.</strong>
        </p>
        <p className="text-stone-600">
          Los estudios de screening (detección temprana) son controles médicos que se realizan cuando te sentís bien,
          para encontrar enfermedades en etapas iniciales, cuando son más fáciles de tratar.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-green-900 mb-4">
          Beneficios de la detección temprana:
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Salva vidas</h4>
              <p className="text-sm text-green-800">
                Detectar cáncer, diabetes o enfermedades cardíacas a tiempo puede evitar complicaciones graves
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Tratamientos menos invasivos</h4>
              <p className="text-sm text-green-800">
                Cuanto antes se detecta un problema, más sencillo es el tratamiento
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Mejor calidad de vida</h4>
              <p className="text-sm text-green-800">
                Prevenir es mejor que curar
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Tranquilidad</h4>
              <p className="text-sm text-green-800">
                Saber que estás bien te da paz mental
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-stone-900 mb-4">
          Guía Rápida por Edades
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-stone-300">
            <thead>
              <tr className="bg-stone-100">
                <th className="px-4 py-3 text-left font-bold text-stone-900 border-b-2 border-stone-300">
                  Edad
                </th>
                <th className="px-4 py-3 text-left font-bold text-stone-900 border-b-2 border-stone-300">
                  Estudios Recomendados
                </th>
                <th className="px-4 py-3 text-left font-bold text-stone-900 border-b-2 border-stone-300">
                  Frecuencia
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200">
                <td className="px-4 py-3 font-semibold text-stone-800">18+</td>
                <td className="px-4 py-3 text-stone-700">Presión arterial, Control odontológico</td>
                <td className="px-4 py-3 text-stone-600">Anual / Cada 6 meses</td>
              </tr>
              <tr className="border-b border-stone-200 bg-stone-50">
                <td className="px-4 py-3 font-semibold text-stone-800">25-64 (♀)</td>
                <td className="px-4 py-3 text-stone-700">PAP / VPH</td>
                <td className="px-4 py-3 text-stone-600">Cada 3 años / Cada 5 años</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="px-4 py-3 font-semibold text-stone-800">35-45+</td>
                <td className="px-4 py-3 text-stone-700">Glucemia, Colesterol</td>
                <td className="px-4 py-3 text-stone-600">Cada 3-5 años</td>
              </tr>
              <tr className="border-b border-stone-200 bg-stone-50">
                <td className="px-4 py-3 font-semibold text-stone-800">50-69 (♀)</td>
                <td className="px-4 py-3 text-stone-700">Mamografía</td>
                <td className="px-4 py-3 text-stone-600">Cada 2 años</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="px-4 py-3 font-semibold text-stone-800">50-75</td>
                <td className="px-4 py-3 text-stone-700">Colonoscopia</td>
                <td className="px-4 py-3 text-stone-600">Cada 10 años</td>
              </tr>
              <tr className="border-b border-stone-200 bg-stone-50">
                <td className="px-4 py-3 font-semibold text-stone-800">50-75 (♂)</td>
                <td className="px-4 py-3 text-stone-700">PSA, Tacto rectal</td>
                <td className="px-4 py-3 text-stone-600">Anual</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-stone-800">65+</td>
                <td className="px-4 py-3 text-stone-700">Densitometría ósea, Vacunas</td>
                <td className="px-4 py-3 text-stone-600">Cada 2 años / Anual</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-stone-800 text-white rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">
          "Tu salud está en tus manos"
        </h3>
        <p className="text-stone-200 text-lg mb-6">
          No esperes a sentirte mal para consultar al médico. Los chequeos preventivos son la mejor manera de cuidarte.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary-ivory px-6 py-3 text-lg font-bold"
          >
            📊 Ver calculadora personalizada
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-secondary-ivory px-6 py-3 text-lg font-bold"
          >
            ⏰ Ver línea de tiempo
          </button>
        </div>
      </div>
    </div>
  );
}
