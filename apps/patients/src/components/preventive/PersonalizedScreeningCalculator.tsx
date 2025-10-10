'use client';

import { useState, useMemo } from 'react';
import { Calculator, User, Calendar, AlertCircle, CheckCircle2, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const handleCalculate = () => {
    if (age && gender) {
      setHasCalculated(true);
      setIsFormCollapsed(true); // Colapsar formulario al calcular
      onCalculate?.(parseInt(age), gender);
    }
  };

  const toggleExpanded = (screeningId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [screeningId]: !prev[screeningId]
    }));
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
      {/* Header - Clickeable cuando hay resultados */}
      <button
        onClick={() => hasCalculated && setIsFormCollapsed(!isFormCollapsed)}
        className={`w-full flex items-center justify-between gap-3 mb-6 ${hasCalculated ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-stone-700" />
          <div className="text-left">
            <h2 className="heading-2">Calculadora Personalizada</h2>
            <p className="text-sm text-stone-600">
              {hasCalculated
                ? `${age} años - ${gender === 'male' ? 'Masculino' : 'Femenino'}`
                : 'Descubrí qué controles te corresponden según tu edad y género'}
            </p>
          </div>
        </div>
        {hasCalculated && (
          isFormCollapsed ? (
            <ChevronDown className="h-5 w-5 text-stone-700 flex-shrink-0" />
          ) : (
            <ChevronUp className="h-5 w-5 text-stone-700 flex-shrink-0" />
          )
        )}
      </button>

      {/* Form - Colapsable */}
      {!isFormCollapsed && (
        <div className="transition-all duration-300 ease-in-out">
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
        </div>
      )}

      {/* Results */}
      {hasCalculated && recommendedScreenings.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Summary cards - compactas */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <AlertCircle className="h-5 w-5 text-red-600 mb-1" />
              <p className="text-xl font-bold text-red-900">{urgentScreenings.length}</p>
              <p className="text-xs text-red-700 font-semibold">Prioritarios</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
              <Clock className="h-5 w-5 text-amber-600 mb-1" />
              <p className="text-xl font-bold text-amber-900">{mediumScreenings.length}</p>
              <p className="text-xs text-amber-700 font-semibold">Importantes</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mb-1" />
              <p className="text-xl font-bold text-green-900">{recommendedScreenings.length}</p>
              <p className="text-xs text-green-700 font-semibold">Total</p>
            </div>
          </div>

          {/* Alert for important screenings - compacto */}
          {urgentScreenings.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 mb-0.5 text-sm">
                    ¡Tenés {urgentScreenings.length} control{urgentScreenings.length > 1 ? 'es' : ''} prioritario{urgentScreenings.length > 1 ? 's' : ''}!
                  </h4>
                  <p className="text-xs text-red-800">
                    Estos estudios son fundamentales para tu salud. Agenda una consulta con tu médico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Screenings by category */}
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-3">
              Tus Controles Recomendados
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
              {Object.entries(groupedScreenings).map(([category, screenings]) => {
                if (screenings.length === 0) return null;
                const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
                const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

                return (
                  <div key={category}>
                    <h4 className={`font-bold text-base mb-2 ${colors.text}`}>
                      {label} ({screenings.length})
                    </h4>
                    <div className="grid gap-2">
                      {screenings.map(screening => {
                        const Icon = getIconComponent(screening.icon);
                        const isExpanded = expandedItems[screening.id] || false;

                        return (
                          <div
                            key={screening.id}
                            className={`${colors.bg} border-2 ${colors.border} rounded-lg p-2.5`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Icon - más pequeño */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                                <Icon className={`h-4 w-4 ${colors.text}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                  <h5 className={`font-bold ${colors.text} text-sm leading-tight`}>
                                    {screening.name}
                                  </h5>
                                  {screening.urgency === 'high' && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full whitespace-nowrap">
                                      PRIORITARIO
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-stone-600 mb-1.5 line-clamp-2">
                                  {screening.description}
                                </p>

                                {/* Detalles compactos */}
                                <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mb-1.5 text-[10px] text-stone-600">
                                  <div className="flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>{screening.frequency}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <Calendar className="h-2.5 w-2.5" />
                                    <span>{screening.startAge}+ años</span>
                                  </div>
                                  {screening.coverage === 'total' && (
                                    <span className="px-1 py-0.5 bg-green-100 text-green-700 font-semibold rounded text-[9px]">
                                      ✅ 100%
                                    </span>
                                  )}
                                </div>

                                {/* Botón para expandir detalles */}
                                <button
                                  onClick={() => toggleExpanded(screening.id)}
                                  className="text-[10px] text-stone-700 hover:text-stone-900 font-medium underline"
                                >
                                  {isExpanded ? '▼ Ver menos' : '▶ Ver más detalles'}
                                </button>

                                {/* Detalles expandibles */}
                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
                                    {/* Benefits */}
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-700 mb-1">BENEFICIOS:</p>
                                      <ul className="text-[11px] text-stone-600 space-y-0.5">
                                        {screening.benefits.slice(0, 3).map((benefit, idx) => (
                                          <li key={idx} className="flex items-start gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Special cases */}
                                    {screening.specialCases && screening.specialCases.length > 0 && (
                                      <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
                                        <div className="flex items-start gap-1.5">
                                          <Info className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                          <div className="text-[11px] text-blue-800">
                                            <strong>Nota:</strong> {screening.specialCases[0]}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
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
