'use client';

import { useState } from 'react';
import type {
  MedicalHistoryTimeline as MedicalHistoryTimelineData,
  MedicalHistoryCondition,
  MedicalAllergy,
  PatientMedication,
  MedicalProcedure,
  MedicalEncounter,
  Immunization
} from '@autamedica/types';

interface MedicalHistoryTimelineProps {
  timeline: MedicalHistoryTimelineData;
  className?: string;
}

type FilterType = 'all' | 'conditions' | 'allergies' | 'medications' | 'procedures' | 'encounters' | 'immunizations';

interface TimelineItem {
  id: string;
  type: FilterType;
  date: string;
  title: string;
  description: string;
  status?: string;
  urgency?: 'low' | 'medium' | 'high';
  data: any;
}

export function MedicalHistoryTimeline({ timeline, className = '' }: MedicalHistoryTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  // Consolidate all medical data into timeline items
  const createTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Add conditions
    timeline.sections.conditions.forEach((condition: MedicalHistoryCondition) => {
      items.push({
        id: condition.id,
        type: 'conditions',
        date: condition.onset_date || condition.created_at,
        title: condition.name,
        description: condition.notes || `Estado: ${condition.status}`,
        status: condition.status,
        urgency: condition.severity === 'severe' ? 'high' : condition.severity === 'moderate' ? 'medium' : 'low',
        data: condition
      });
    });

    // Add allergies
    timeline.sections.allergies.forEach((allergy: MedicalAllergy) => {
      items.push({
        id: allergy.id,
        type: 'allergies',
        date: allergy.onset_date || allergy.created_at,
        title: `Alergia: ${allergy.allergen}`,
        description: allergy.reaction_description || `Tipo: ${allergy.allergen_type}`,
        urgency: allergy.severity === 'life_threatening' || allergy.severity === 'severe' ? 'high' : 'medium',
        data: allergy
      });
    });

    // Add medications
    timeline.sections.medications.forEach((medication: PatientMedication) => {
      items.push({
        id: medication.id,
        type: 'medications',
        date: medication.start_date,
        title: medication.name,
        description: `${medication.dosage} - ${medication.frequency}`,
        status: medication.status,
        urgency: 'low',
        data: medication
      });
    });

    // Add procedures
    timeline.sections.procedures.forEach((procedure: MedicalProcedure) => {
      items.push({
        id: procedure.id,
        type: 'procedures',
        date: procedure.performed_date,
        title: procedure.name,
        description: procedure.indication || procedure.outcome || '',
        urgency: 'medium',
        data: procedure
      });
    });

    // Add encounters
    timeline.sections.encounters.forEach((encounter: MedicalEncounter) => {
      items.push({
        id: encounter.id,
        type: 'encounters',
        date: encounter.encounter_date,
        title: `Consulta: ${encounter.encounter_type}`,
        description: encounter.chief_complaint || encounter.assessment || '',
        urgency: encounter.encounter_type === 'emergency' ? 'high' : 'low',
        data: encounter
      });
    });

    // Add immunizations
    timeline.sections.immunizations.forEach((immunization: Immunization) => {
      items.push({
        id: immunization.id,
        type: 'immunizations',
        date: immunization.administration_date,
        title: `Vacuna: ${immunization.vaccine_name}`,
        description: immunization.notes || `Dosis: ${immunization.dose_number || 1}`,
        urgency: 'low',
        data: immunization
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineItems = createTimelineItems();

  // Filter items
  const filteredItems = timelineItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: FilterType): string => {
    switch (type) {
      case 'conditions': return '🩺';
      case 'allergies': return '⚠️';
      case 'medications': return '💊';
      case 'procedures': return '🏥';
      case 'encounters': return '👩‍⚕️';
      case 'immunizations': return '💉';
      default: return '📋';
    }
  };

  const getUrgencyColor = (urgency?: string): string => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: timelineItems.length },
    { key: 'conditions', label: 'Condiciones', count: timeline.sections.conditions.length },
    { key: 'allergies', label: 'Alergias', count: timeline.sections.allergies.length },
    { key: 'medications', label: 'Medicamentos', count: timeline.sections.medications.length },
    { key: 'procedures', label: 'Procedimientos', count: timeline.sections.procedures.length },
    { key: 'encounters', label: 'Consultas', count: timeline.sections.encounters.length },
    { key: 'immunizations', label: 'Vacunas', count: timeline.sections.immunizations.length },
  ];

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en historia clínica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
            🔍
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-lg">No se encontraron registros</p>
            <p className="text-sm">Intenta cambiar los filtros o el término de búsqueda</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index < filteredItems.length - 1 && (
                <div className="absolute left-6 top-12 h-full w-0.5 bg-white/20" />
              )}

              {/* Timeline Item */}
              <div
                className={`relative flex items-start space-x-4 p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all hover:bg-white/5 ${getUrgencyColor(item.urgency)}`}
                onClick={() => setSelectedItem(item)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-xl">{getTypeIcon(item.type)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium truncate">{item.title}</h3>
                    <span className="text-white/60 text-sm flex-shrink-0 ml-2">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {item.status && (
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'active' || item.status === 'under_treatment'
                          ? 'bg-green-500/20 text-green-400'
                          : item.status === 'resolved' || item.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Urgency Indicator */}
                {item.urgency === 'high' && (
                  <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(selectedItem.type)}</span>
                  <h2 className="text-xl font-semibold text-white">{selectedItem.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/60 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Fecha</label>
                  <p className="text-white">{formatDate(selectedItem.date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Descripción</label>
                  <p className="text-white leading-relaxed">{selectedItem.description}</p>
                </div>

                {selectedItem.status && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedItem.status === 'active' || selectedItem.status === 'under_treatment'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedItem.status === 'resolved' || selectedItem.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedItem.status}
                    </span>
                  </div>
                )}

                {/* Additional details based on type */}
                {selectedItem.type === 'medications' && selectedItem.data.indication && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Indicación</label>
                    <p className="text-white">{selectedItem.data.indication}</p>
                  </div>
                )}

                {selectedItem.type === 'allergies' && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Severidad</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedItem.data.severity === 'life_threatening' || selectedItem.data.severity === 'severe'
                        ? 'bg-red-500/20 text-red-400'
                        : selectedItem.data.severity === 'moderate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedItem.data.severity}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/20 text-right">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}