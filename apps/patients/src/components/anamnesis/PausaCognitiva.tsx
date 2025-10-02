'use client';

import { useState, useEffect } from 'react';
import { Coffee, Brain, Clock } from 'lucide-react';

interface PausaCognitivaProps {
  stepNumber: number;
  onContinue: () => void;
}

export function PausaCognitiva({ stepNumber, onContinue }: PausaCognitivaProps) {
  const [countdown, setCountdown] = useState(30); // 30 segundos de pausa obligatoria
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanContinue(true);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl p-12 text-center">
        {/* Icono animado */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Coffee className="h-12 w-12 text-white" />
        </div>

        {/* Título */}
        <h2 className="text-4xl font-bold text-stone-900 mb-4">
          ⏸️ Pausa para Reflexionar
        </h2>

        {/* Mensaje principal */}
        <div className="bg-white/80 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-orange-600" />
            <p className="text-xl font-semibold text-stone-800">
              Has completado {stepNumber} pasos
            </p>
          </div>

          <p className="text-lg text-stone-700 leading-relaxed mb-4">
            La anamnesis requiere <strong>concentración y precisión</strong>.
            Tómate un momento para:
          </p>

          <ul className="text-left space-y-3 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <span className="text-2xl">💭</span>
              <div>
                <strong className="text-stone-900">Reflexionar:</strong>
                <span className="text-stone-700"> ¿Respondiste con honestidad y detalle?</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🧘</span>
              <div>
                <strong className="text-stone-900">Respirar:</strong>
                <span className="text-stone-700"> Relaja tus hombros, toma aire profundo</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <strong className="text-stone-900">Hidratarte:</strong>
                <span className="text-stone-700"> Bebe un poco de agua si es necesario</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <strong className="text-stone-900">Recordar:</strong>
                <span className="text-stone-700"> Cada detalle importa para tu médico</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Countdown */}
        {!canContinue ? (
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-orange-600" />
              <p className="text-sm font-medium text-orange-900">
                Tiempo de pausa obligatoria
              </p>
            </div>
            <div className="text-5xl font-bold text-orange-600">
              {countdown}s
            </div>
            <p className="text-sm text-orange-700 mt-2">
              Esta pausa te ayuda a mantener la concentración
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✓ ¡Listo! Puedes continuar cuando quieras
            </p>
          </div>
        )}

        {/* Botón */}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-xl hover:scale-105'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          {canContinue ? '✓ Continuar con mi Anamnesis' : '⏳ Esperando...'}
        </button>

        {/* Footer info */}
        <p className="text-xs text-stone-600 mt-6">
          💡 <strong>¿Por qué estas pausas?</strong> El agotamiento cognitivo hace que respondas
          "en piloto automático", lo que puede generar información imprecisa. Estas pausas
          garantizan respuestas reflexivas y de calidad.
        </p>
      </div>
    </div>
  );
}
