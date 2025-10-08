'use client';

import { useState, useMemo } from 'react';
import { Calculator, User, Calendar, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getRecommendedScreenings, groupScreeningsByCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/screenings';

interface PersonalizedScreeningCalculatorProps {
  defaultAge?: number;
  defaultGender?: 'male' | 'female';
  onCalculate?: (age: number, gender: 'male' | 'female') => void;
}

export function PersonalizedScreeningCalculator({
  defaultAge,
  defaultGender,
  onCalculate
}: PersonalizedScreeningCalculatorProps) {
  const [age, setAge] = useState<string>(defaultAge?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(defaultGender || '');
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleCalculate = () => {
    if (age && gender) {
      setHasCalculated(true);
      onCalculate?.(parseInt(age), gender);
    }
  };

  const recommendedScreenings = useMemo(() => {
    if (!age || !gender || !hasCalculated) return [];
    return getRecommendedScreenings(parseInt(age), gender);
  }, [age, gender, hasCalculated]);

  const groupedScreenings = useMemo(() => {
    if (recommendedScreenings.length === 0) return {};
    return groupScreeningsByCategory(recommendedScreenings);
  }, [recommendedScreenings]);

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return Icon;
  };

  const urgentScreenings = recommendedScreenings.filter(s => s.urgency === 'high');
  const mediumScreenings = recommendedScreenings.filter(s => s.urgency === 'medium');

  return (
    <div className="bg-gradient-to-br from-stone-50 to-white rounded-xl border-2 border-stone-300 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-stone-700" />
        <div>
          <h2 className="heading-2">Calculadora Personalizada</h2>
          <p className="text-sm text-stone-600">Descubrí qué controles te corresponden según tu edad y género</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Age input */}
        <div>
          <label htmlFor="age-input" className="block text-sm font-semibold text-stone-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Tu edad
          </label>
          <input
            id="age-input"
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ej: 45"
            className="w-full px-4 py-3 rounded-lg border-2 border-stone-300 focus:border-stone-800 focus:ring-2 focus:ring-stone-200 transition-colors text-lg font-semibold"
          />
        </div>

        {/* Gender selector */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Género
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGender('male')}
              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                gender === 'male'
                  ? 'bg-stone-800 text-white border-stone-900 shadow-md'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              👨 Masculino
            </button>
            <button
              onClick={() => setGender('female')}
              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                gender === 'female'
                  ? 'bg-stone-800 text-white border-stone-900 shadow-md'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              👩 Femenino
            </button>
          </div>
        </div>
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!age || !gender}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
          !age || !gender
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
            : 'bg-stone-800 hover:bg-stone-900 text-white shadow-md hover:shadow-lg'
        }`}
      >
        🔍 Ver mis controles recomendados
      </button>

      {/* Results */}
      {hasCalculated && recommendedScreenings.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-900">{urgentScreenings.length}</p>
              <p className="text-sm text-red-700 font-semibold">Prioritarios</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <Clock className="h-6 w-6 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-amber-900">{mediumScreenings.length}</p>
              <p className="text-sm text-amber-700 font-semibold">Importantes</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-900">{recommendedScreenings.length}</p>
              <p className="text-sm text-green-700 font-semibold">Total</p>
            </div>
          </div>

          {/* Alert for important screenings */}
          {urgentScreenings.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1">
                    ¡Tenés {urgentScreenings.length} control{urgentScreenings.length > 1 ? 'es' : ''} prioritario{urgentScreenings.length > 1 ? 's' : ''}!
                  </h4>
                  <p className="text-sm text-red-800">
                    Estos estudios son fundamentales para tu salud. Agenda una consulta con tu médico para realizarlos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Screenings by category */}
          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-4">
              Tus Controles Recomendados
            </h3>
            <div className="space-y-6">
              {Object.entries(groupedScreenings).map(([category, screenings]) => {
                if (screenings.length === 0) return null;
                const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
                const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

                return (
                  <div key={category}>
                    <h4 className={`font-bold text-lg mb-3 ${colors.text}`}>
                      {label} ({screenings.length})
                    </h4>
                    <div className="grid gap-3">
                      {screenings.map(screening => {
                        const Icon = getIconComponent(screening.icon);
                        return (
                          <div
                            key={screening.id}
                            className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                                <Icon className={`h-6 w-6 ${colors.text}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h5 className={`font-bold ${colors.text} text-lg`}>
                                    {screening.name}
                                  </h5>
                                  {screening.urgency === 'high' && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                      PRIORITARIO
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-stone-700 mb-3">
                                  {screening.description}
                                </p>

                                {/* Details */}
                                <div className="grid md:grid-cols-2 gap-2 mb-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-stone-600" />
                                    <span className="text-stone-700">
                                      <strong>Frecuencia:</strong> {screening.frequency}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-stone-600" />
                                    <span className="text-stone-700">
                                      <strong>Desde:</strong> {screening.startAge} años
                                      {screening.endAge && ` hasta ${screening.endAge} años`}
                                    </span>
                                  </div>
                                </div>

                                {/* Benefits */}
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-stone-700 mb-1">Beneficios:</p>
                                  <ul className="text-xs text-stone-600 space-y-1">
                                    {screening.benefits.map((benefit, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Special cases */}
                                {screening.specialCases && screening.specialCases.length > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                    <div className="flex items-start gap-2">
                                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                      <div className="text-xs text-blue-800">
                                        <strong>Nota:</strong> {screening.specialCases.join('. ')}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Coverage badge */}
                                <div className="mt-3 flex items-center gap-2">
                                  {screening.coverage === 'total' && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                      ✅ Cobertura 100%
                                    </span>
                                  )}
                                  {screening.coverage === 'partial' && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                      Cobertura parcial
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-stone-800 text-white rounded-xl p-6 text-center">
            <h4 className="text-xl font-bold mb-2">¿Listo para cuidar tu salud?</h4>
            <p className="mb-4 text-stone-200">
              Programa una cita con tu médico para realizar estos controles
            </p>
            <button className="btn-primary-ivory px-6 py-3 text-lg font-bold">
              📅 Agendar consulta médica
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {hasCalculated && recommendedScreenings.length === 0 && (
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <Info className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <p className="text-blue-900 font-semibold">
            No se encontraron screenings recomendados para esta edad y género.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Esto puede ser normal. Consulta con tu médico para recomendaciones personalizadas.
          </p>
        </div>
      )}
    </div>
  );
}
