'use client';

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getAgeMilestones, SCREENINGS_DATABASE, CATEGORY_COLORS, type Screening } from '@/data/screenings';

interface ScreeningTimelineProps {
  currentAge?: number;
  gender?: 'male' | 'female';
}

export function ScreeningTimeline({ currentAge, gender }: ScreeningTimelineProps) {
  const [expandedAges, setExpandedAges] = useState<Set<number>>(new Set());
  const milestones = getAgeMilestones();

  const toggleAge = (age: number) => {
    setExpandedAges(prev => {
      const next = new Set(prev);
      if (next.has(age)) {
        next.delete(age);
      } else {
        next.add(age);
      }
      return next;
    });
  };

  const getScreeningsStartingAtAge = (age: number): Screening[] => {
    return SCREENINGS_DATABASE.filter(s => {
      // Filtro por género
      if (gender && s.gender !== 'all' && s.gender !== gender) {
        return false;
      }
      return s.startAge === age;
    });
  };

  const getScreeningsEndingAtAge = (age: number): Screening[] => {
    return SCREENINGS_DATABASE.filter(s => {
      if (gender && s.gender !== 'all' && s.gender !== gender) {
        return false;
      }
      return s.endAge === age;
    });
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return Icon;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-stone-300 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-6 w-6 text-stone-700" />
        <div>
          <h2 className="heading-2">Línea de Tiempo de Salud Preventiva</h2>
          <p className="text-sm text-stone-600">¿Qué estudios me corresponden a cada edad?</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-stone-200">
        <span className="text-sm font-medium text-stone-700">Categorías:</span>
        {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
          <span
            key={category}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-stone-300" />

        <div className="space-y-4">
          {milestones.map((age, index) => {
            const startingScreenings = getScreeningsStartingAtAge(age);
            const endingScreenings = getScreeningsEndingAtAge(age);
            const isExpanded = expandedAges.has(age);
            const isCurrentAge = currentAge === age;
            const isPastAge = currentAge !== undefined && age < currentAge;
            const isFutureAge = currentAge !== undefined && age > currentAge;

            if (startingScreenings.length === 0 && endingScreenings.length === 0) {
              return null;
            }

            return (
              <div key={age} className="relative">
                {/* Age marker */}
                <div className="flex items-start gap-4">
                  {/* Circle */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4 shadow-md ${
                      isCurrentAge
                        ? 'bg-stone-800 text-white border-stone-900'
                        : isPastAge
                        ? 'bg-stone-200 text-stone-600 border-stone-300'
                        : 'bg-white text-stone-800 border-stone-400'
                    }`}
                  >
                    {age}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <button
                      onClick={() => toggleAge(age)}
                      className="w-full text-left bg-stone-50 hover:bg-stone-100 rounded-xl p-4 border-2 border-stone-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-stone-900 mb-1">
                            {age} años
                            {isCurrentAge && (
                              <span className="ml-2 px-2 py-0.5 bg-stone-800 text-white text-xs rounded-full">
                                TU EDAD
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-stone-600">
                            {startingScreenings.length > 0 && (
                              <span className="text-green-700 font-semibold">
                                +{startingScreenings.length} nuevo{startingScreenings.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {startingScreenings.length > 0 && endingScreenings.length > 0 && ' · '}
                            {endingScreenings.length > 0 && (
                              <span className="text-amber-700 font-semibold">
                                {endingScreenings.length} finaliza{endingScreenings.length > 1 ? 'n' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-stone-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-stone-600" />
                        )}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {startingScreenings.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-green-700 mb-2">
                              ✅ Comienzan a esta edad:
                            </h4>
                            <div className="space-y-2">
                              {startingScreenings.map(screening => {
                                const Icon = getIconComponent(screening.icon);
                                const colors = CATEGORY_COLORS[screening.category];
                                return (
                                  <div
                                    key={screening.id}
                                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <Icon className={`h-5 w-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                                      <div className="flex-1">
                                        <h5 className={`font-semibold ${colors.text}`}>
                                          {screening.shortName}
                                        </h5>
                                        <p className="text-xs text-stone-600 mt-1">
                                          {screening.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                          <span className="text-stone-700">
                                            <strong>Frecuencia:</strong> {screening.frequency}
                                          </span>
                                          {screening.endAge && (
                                            <span className="text-stone-700">
                                              <strong>Hasta:</strong> {screening.endAge} años
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
                        )}

                        {endingScreenings.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-amber-700 mb-2">
                              ⚠️ Finalizan a esta edad:
                            </h4>
                            <div className="space-y-2">
                              {endingScreenings.map(screening => {
                                const Icon = getIconComponent(screening.icon);
                                return (
                                  <div
                                    key={screening.id}
                                    className="p-3 rounded-lg bg-amber-50 border border-amber-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Icon className="h-5 w-5 text-amber-600" />
                                      <span className="text-sm font-medium text-amber-800">
                                        {screening.shortName}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
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

      {/* Footer tip */}
      <div className="mt-6 pt-6 border-t border-stone-200">
        <p className="text-sm text-stone-600 text-center">
          💡 <strong>Tip:</strong> Haz clic en cada edad para ver qué estudios comienzan o finalizan
        </p>
      </div>
    </div>
  );
}
