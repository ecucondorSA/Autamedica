'use client';

import { useState } from 'react';
import type { AnamnesisField as FieldType } from '../../types/anamnesis';
import { CheckCircle, HelpCircle } from 'lucide-react';

interface AnamnesisFieldProps {
  field: FieldType;
  value: any;
  onChange: (value: any) => void;
  onComplete?: () => void;
}

export function AnamnesisField({ field, value, onChange, onComplete }: AnamnesisFieldProps) {
  const [showEducationalNote, setShowEducationalNote] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (newValue: any) => {
    onChange(newValue);
    if (field.educationalNote && newValue) {
      setShowEducationalNote(true);
      onComplete?.();
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 text-sm border-2 border-stone-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-stone-900"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-3 py-2 text-sm border-2 border-stone-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-stone-900 resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-sm border-2 border-stone-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-stone-900"
          >
            <option value="">Selecciona una opción</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="grid md:grid-cols-2 gap-3">
            {field.options?.map((option) => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                    isSelected
                      ? 'border-sky-300 bg-sky-100'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = e.target.checked
                        ? [...currentValue, option.value]
                        : currentValue.filter((v) => v !== option.value);
                      handleChange(newValue);
                    }}
                    className="mt-0.5 h-4 w-4 text-sky-600 border-stone-300 rounded focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{option.label}</p>
                    {option.explanation && (
                      <p className="text-sm text-stone-500 mt-1">{option.explanation}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex gap-3">
            <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
              value === true ? 'border-green-500 bg-green-50' : 'border-stone-200 hover:border-stone-300'
            }`}>
              <input
                type="radio"
                checked={value === true}
                onChange={() => handleChange(true)}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-stone-900">✓ Sí</span>
            </label>
            <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
              value === false ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:border-stone-300'
            }`}>
              <input
                type="radio"
                checked={value === false}
                onChange={() => handleChange(false)}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-stone-900">✗ No</span>
            </label>
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={field.validation?.min || 1}
              max={field.validation?.max || 10}
              value={value || field.validation?.min || 1}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-sm text-stone-600">
              <span>1 (Leve)</span>
              <span className="text-lg font-bold text-stone-900">{value || field.validation?.min || 1}</span>
              <span>10 (Insoportable)</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-sm border-2 border-stone-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-stone-900"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Label con tooltip */}
      <div className="flex items-start justify-between gap-2">
        <label className="text-sm font-medium text-stone-700 flex-1">
          {field.label}
          {field.required && <span className="text-red-600 ml-1">*</span>}
        </label>
        {field.tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 z-10 w-64 p-3 bg-stone-900 text-white text-sm rounded-lg shadow-xl">
                <p className="whitespace-pre-line">{field.tooltip}</p>
                <div className="absolute -top-1 right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-stone-900"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campo */}
      {renderField()}

      {/* Nota educativa al completar */}
      {showEducationalNote && field.educationalNote && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg animate-fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-900 font-medium mb-1">¡Excelente!</p>
              <p className="text-sm text-green-800">{field.educationalNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
