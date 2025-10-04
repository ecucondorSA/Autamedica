'use client';

import { BookOpen, Lightbulb, Users, Info } from 'lucide-react';

interface StoryCardProps {
  intro: string;
  why: string;
  example?: string;
  didYouKnow?: string;
}

export function StoryCard({ intro, why, example, didYouKnow }: StoryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {/* Introducción */}
      <div className="card-ivory-elevated p-3 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        <div className="flex items-start gap-2 min-w-0">
          <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">La Historia</h3>
            <p className="text-xs text-blue-800 leading-relaxed break-words">{intro}</p>
          </div>
        </div>
      </div>

      {/* Por qué preguntamos esto */}
      <div className="card-ivory p-3 border-l-4 border-emerald-500 overflow-hidden">
        <div className="flex items-start gap-2 min-w-0">
          <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-emerald-900 mb-1">¿Por qué preguntamos?</h4>
            <p className="text-xs text-emerald-800 leading-relaxed break-words">{why}</p>
          </div>
        </div>
      </div>

      {/* Ejemplo clínico */}
      {example && (
        <div className="card-ivory p-3 bg-amber-50 border border-amber-200 overflow-hidden">
          <div className="flex items-start gap-2 min-w-0">
            <Users className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">Ejemplo Real</h4>
              <p className="text-xs text-amber-800 whitespace-pre-line leading-relaxed break-words">{example}</p>
            </div>
          </div>
        </div>
      )}

      {/* ¿Sabías que? */}
      {didYouKnow && (
        <div className="card-ivory-elevated p-3 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300 overflow-hidden">
          <div className="flex items-start gap-2 min-w-0">
            <Lightbulb className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-purple-900 mb-1">💡 ¿Sabías que...?</h4>
              <p className="text-xs text-purple-800 whitespace-pre-line leading-relaxed break-words">{didYouKnow}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
