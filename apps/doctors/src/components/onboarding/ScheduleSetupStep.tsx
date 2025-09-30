'use client';

import React, { useState } from 'react';
import { WeeklySchedule, DaySchedule } from '@autamedica/types';

interface ScheduleSetupStepProps {
  schedule: WeeklySchedule;
  consultationFee?: number;
  acceptedInsurance: string[];
  onUpdate: (schedule: WeeklySchedule, consultationFee?: number, acceptedInsurance?: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
] as const;

const COMMON_INSURANCE = [
  'OSDE',
  'Swiss Medical',
  'Medicus',
  'IOMA',
  'PAMI',
  'Galeno',
  'Medifé',
  'Hospital Italiano',
  'Hospital Alemán',
  'CEMIC',
  'Obra Social Empleados de Comercio',
  'OSECAC',
  'OSPLAD',
  'OSPEDYC'
] as const;

export function ScheduleSetupStep({
  schedule,
  consultationFee,
  acceptedInsurance,
  onUpdate,
  onNext,
  onBack
}: ScheduleSetupStepProps) {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(schedule);
  const [fee, setFee] = useState<number>(consultationFee || 0);
  const [insurance, setInsurance] = useState<string[]>(acceptedInsurance);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);

  const updateDaySchedule = (day: keyof WeeklySchedule, daySchedule: DaySchedule | undefined) => {
    const updated = { ...weeklySchedule, [day]: daySchedule };
    setWeeklySchedule(updated);
    onUpdate(updated, fee, insurance);
  };

  const toggleInsurance = (insuranceName: string) => {
    const updated = insurance.includes(insuranceName)
      ? insurance.filter(name => name !== insuranceName)
      : [...insurance, insuranceName];
    setInsurance(updated);
    onUpdate(weeklySchedule, fee, updated);
  };

  const updateFee = (newFee: number) => {
    setFee(newFee);
    onUpdate(weeklySchedule, newFee, insurance);
  };

  const DayScheduleEditor = ({ day, label }: { day: keyof WeeklySchedule; label: string }) => {
    const daySchedule = weeklySchedule[day];
    const isActive = !!daySchedule;

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => {
                if (e.target.checked) {
                  updateDaySchedule(day, { start: '09:00', end: '17:00' });
                } else {
                  updateDaySchedule(day, undefined);
                }
              }}
              className="mr-2"
            />
            <span className="font-medium text-gray-900">{label}</span>
          </label>
        </div>

        {isActive && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Desde</label>
              <input
                type="time"
                value={daySchedule?.start || '09:00'}
                onChange={(e) => updateDaySchedule(day, { ...daySchedule!, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hasta</label>
              <input
                type="time"
                value={daySchedule?.end || '17:00'}
                onChange={(e) => updateDaySchedule(day, { ...daySchedule!, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Horarios y Configuración de Consultas
        </h3>
        <p className="text-gray-600">
          Define tus horarios de atención y configuración de consultas médicas.
        </p>
      </div>

      {/* Horarios semanales */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Horarios de Atención</h4>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => (
            <DayScheduleEditor key={key} day={key} label={label} />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              const fullWeekSchedule: WeeklySchedule = {
                monday: { start: '09:00', end: '17:00' },
                tuesday: { start: '09:00', end: '17:00' },
                wednesday: { start: '09:00', end: '17:00' },
                thursday: { start: '09:00', end: '17:00' },
                friday: { start: '09:00', end: '17:00' }
              };
              setWeeklySchedule(fullWeekSchedule);
              onUpdate(fullWeekSchedule, fee, insurance);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Lunes a Viernes 9-17hs
          </button>
          <button
            onClick={() => {
              setWeeklySchedule({});
              onUpdate({}, fee, insurance);
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Precio de consulta */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-2">Precio de Consulta</h4>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">$</span>
          <input
            type="number"
            value={fee}
            onChange={(e) => updateFee(parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="500"
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500 text-sm">ARS (pesos argentinos)</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Puedes cambiar este precio en cualquier momento. Deja en 0 si prefieres no mostrar precios.
        </p>
      </div>

      {/* Obras sociales aceptadas */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-2">Obras Sociales Aceptadas</h4>

        <div className="relative">
          <button
            onClick={() => setShowInsuranceDropdown(!showInsuranceDropdown)}
            className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {insurance.length > 0 ? `${insurance.length} obras sociales seleccionadas` : 'Seleccionar obras sociales...'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showInsuranceDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showInsuranceDropdown && (
            <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-lg p-2 bg-white shadow-lg max-h-60 overflow-y-auto">
              {COMMON_INSURANCE.map(insuranceName => (
                <label key={insuranceName} className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insurance.includes(insuranceName)}
                    onChange={() => toggleInsurance(insuranceName)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{insuranceName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {insurance.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {insurance.map(insuranceName => (
              <span
                key={insuranceName}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {insuranceName}
                <button
                  onClick={() => toggleInsurance(insuranceName)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 text-sm">
              <strong>Nota:</strong> Esta configuración es opcional y puede ser modificada en cualquier momento.
              Los horarios ayudan a los pacientes a saber cuándo pueden contactarte.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Atrás
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}