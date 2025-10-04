'use client';

import { useState } from 'react';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { useAutaOnboardingResponse, type OnboardingStep } from '@/hooks/useOnboardingContext';

interface AutaMiniChatProps {
  stepId: OnboardingStep;
  tip: string;
  suggestedQuestions: string[];
}

/**
 * Mini-chat contextual de Auta para onboarding
 */
export function AutaMiniChat({ stepId, tip, suggestedQuestions }: AutaMiniChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
    setIsExpanded(true);
  };

  const response = selectedQuestion
    ? useAutaOnboardingResponse(stepId, selectedQuestion)
    : null;

  return (
    <div className="mt-4 rounded-xl border-2 border-stone-200 bg-gradient-to-br from-stone-50 to-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-stone-100 transition"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-stone-600 to-stone-800 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-stone-900">🤖 Pregúntale a Auta</p>
            <p className="text-xs text-stone-600">Asistente IA de este paso</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-stone-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-600" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-stone-200 bg-white p-4 space-y-3">
          {/* Auta's Tip */}
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="flex items-start gap-2">
              <Bot className="h-4 w-4 text-stone-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">{tip}</p>
            </div>
          </div>

          {/* Suggested Questions */}
          <div>
            <p className="text-xs font-semibold text-stone-600 mb-2">
              💬 Preguntas frecuentes:
            </p>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(question)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition ${
                    selectedQuestion === question
                      ? 'border-stone-600 bg-stone-100 font-semibold text-stone-900'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Answer */}
          {response && (
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white flex-shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
                <p className="text-sm text-green-900 leading-relaxed">{response}</p>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                // Abrir chat completo de Auta
                const event = new CustomEvent('open-auta-chat');
                window.dispatchEvent(event);
              }}
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline"
            >
              💬 Abrir chat completo con Auta AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
