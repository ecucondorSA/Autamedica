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
    <div className="space-y-4 mb-8">
      {/* Introducción */}
      <div className="card-ivory-elevated p-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-start gap-4">
          <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="heading-3 text-blue-900 mb-2">La Historia</h3>
            <p className="text-body text-blue-800 leading-relaxed">{intro}</p>
          </div>
        </div>
      </div>

      {/* Por qué preguntamos esto */}
      <div className="card-ivory p-5 border-l-4 border-emerald-500">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-900 mb-2">¿Por qué te preguntamos esto?</h4>
            <p className="text-sm text-emerald-800 leading-relaxed">{why}</p>
          </div>
        </div>
      </div>

      {/* Ejemplo clínico */}
      {example && (
        <div className="card-ivory p-5 bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Ejemplo Real</h4>
              <p className="text-sm text-amber-800 whitespace-pre-line leading-relaxed">{example}</p>
            </div>
          </div>
        </div>
      )}

      {/* ¿Sabías que? */}
      {didYouKnow && (
        <div className="card-ivory-elevated p-5 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">💡 ¿Sabías que...?</h4>
              <p className="text-sm text-purple-800 whitespace-pre-line leading-relaxed">{didYouKnow}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
