'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AutaChatbot } from './AutaChatbot';

export function AutaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-stone-700 to-stone-900 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-3xl ring-4 ring-white/20"
          aria-label="Abrir asistente Auta"
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
        </button>
      )}

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] flex-col overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-2xl">
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-stone-600 to-stone-800 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Auta AI</h3>
                <p className="text-xs text-stone-600">Tu asistente médico</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Cerrar asistente"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chatbot content */}
          <div className="flex-1 overflow-hidden">
            <AutaChatbot />
          </div>
        </div>
      )}
    </>
  );
}
