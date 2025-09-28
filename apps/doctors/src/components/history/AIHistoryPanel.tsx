'use client'

import { useState } from 'react'
import { Bot, TrendingUp, Clock, Filter, Download, Search, Brain, FileText, AlertTriangle } from 'lucide-react'

interface AIAnalysis {
  id: string
  patientId: string
  patientName: string
  type: 'diagnosis' | 'risk-assessment' | 'treatment-recommendation' | 'drug-interaction'
  timestamp: string
  confidence: number
  status: 'success' | 'warning' | 'error'
  summary: string
  details: string
  recommendations: string[]
  followUp?: string
}

export function AIHistoryPanel() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null)

  const analyses: AIAnalysis[] = [
    {
      id: '1',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      patientName: 'María González',
      type: 'diagnosis',
      timestamp: '2024-12-20T10:30:00Z',
      confidence: 87,
      status: 'success',
      summary: 'Probable síndrome coronario agudo',
      details: 'Análisis basado en síntomas de dolor torácico, factores de riesgo cardiovascular y alteraciones en signos vitales. La IA identificó patrones consistentes con cardiopatía isquémica aguda.',
      recommendations: [
        'ECG inmediato de 12 derivaciones',
        'Troponinas cardíacas seriadas cada 6 horas',
        'Monitorización continua',
        'Antiagregación plaquetaria si no hay contraindicaciones'
      ],
      followUp: 'Evaluación cardiológica urgente recomendada'
    },
    {
      id: '2',
      patientId: '660f9500-f30c-52e5-b827-556766550001',
      patientName: 'Carlos López',
      type: 'risk-assessment',
      timestamp: '2024-12-20T09:15:00Z',
      confidence: 92,
      status: 'warning',
      summary: 'Riesgo elevado de interacción medicamentosa',
      details: 'La IA detectó una potencial interacción grave entre warfarina y nuevo antibiótico prescrito. Riesgo aumentado de sangrado.',
      recommendations: [
        'Monitorizar INR más frecuentemente',
        'Considerar antibiótico alternativo',
        'Ajustar dosis de warfarina temporalmente',
        'Educación al paciente sobre signos de sangrado'
      ],
      followUp: 'Control de INR en 48-72 horas'
    },
    {
      id: '3',
      patientId: '770a1600-g40d-63f6-c938-667877660002',
      patientName: 'Ana Martínez',
      type: 'treatment-recommendation',
      timestamp: '2024-12-19T16:45:00Z',
      confidence: 78,
      status: 'success',
      summary: 'Optimización de tratamiento para diabetes',
      details: 'Análisis de patrón glucémico sugiere necesidad de ajuste en terapia. HbA1c en 8.2% con episodios de hipoglucemia nocturna.',
      recommendations: [
        'Reducir dosis de insulina basal en 10%',
        'Agregar metformina de liberación prolongada',
        'Educación sobre conteo de carbohidratos',
        'Monitoreo glucémico más frecuente'
      ],
      followUp: 'Control en 4 semanas con HbA1c'
    },
    {
      id: '4',
      patientId: '880b2700-h51e-74g7-d049-778988770003',
      patientName: 'Roberto Silva',
      type: 'drug-interaction',
      timestamp: '2024-12-19T14:20:00Z',
      confidence: 95,
      status: 'error',
      summary: 'Contraindicación absoluta detectada',
      details: 'Paciente con antecedente de alergia severa a penicilina. Prescripción de amoxicilina representa riesgo de anafilaxia.',
      recommendations: [
        'SUSPENDER inmediatamente amoxicilina',
        'Prescribir antibiótico alternativo (azitromicina)',
        'Verificar historial de alergias en futuras prescripciones',
        'Considerar brazalete de alerta médica'
      ],
      followUp: 'Contacto inmediato con paciente requerido'
    }
  ]

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'Diagnóstico'
      case 'risk-assessment': return 'Evaluación de Riesgo'
      case 'treatment-recommendation': return 'Recomendación de Tratamiento'
      case 'drug-interaction': return 'Interacción Medicamentosa'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400'
    if (confidence >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesFilter = selectedFilter === 'all' || analysis.type === selectedFilter
    const matchesSearch = searchTerm === '' ||
      analysis.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="h-full bg-[#101d32] text-slate-100">
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Historial IA</h1>
              <p className="text-sm text-slate-400">Análisis y recomendaciones de inteligencia artificial</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100%-100px)]">
        {/* Lista de análisis */}
        <div className="w-1/2 border-r border-slate-800/60">
          {/* Filtros */}
          <div className="p-4 border-b border-slate-800/60 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente o análisis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los análisis</option>
                <option value="diagnosis">Diagnósticos</option>
                <option value="risk-assessment">Evaluaciones de Riesgo</option>
                <option value="treatment-recommendation">Recomendaciones</option>
                <option value="drug-interaction">Interacciones</option>
              </select>
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-[600px]">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis)}
                className={`p-4 border-b border-slate-800/60 cursor-pointer transition-colors hover:bg-slate-800/40 ${
                  selectedAnalysis?.id === analysis.id ? 'bg-slate-800/60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-slate-100">{analysis.patientName}</h3>
                    <p className="text-sm text-slate-400">{getTypeLabel(analysis.type)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(analysis.status)}`}>
                      {analysis.status.toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                      {analysis.confidence}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-2">{analysis.summary}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(analysis.timestamp).toLocaleString('es-ES')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    IA Analysis
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del análisis */}
        <div className="w-1/2 p-6">
          {selectedAnalysis ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-100">Detalles del Análisis</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAnalysis.status)}`}>
                      {selectedAnalysis.status.toUpperCase()}
                    </span>
                    <span className={`text-lg font-bold ${getConfidenceColor(selectedAnalysis.confidence)}`}>
                      {selectedAnalysis.confidence}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-slate-400 text-sm">Paciente:</span>
                      <p className="text-slate-100 font-medium">{selectedAnalysis.patientName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Tipo de Análisis:</span>
                      <p className="text-slate-100">{getTypeLabel(selectedAnalysis.type)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Fecha:</span>
                      <p className="text-slate-100">{new Date(selectedAnalysis.timestamp).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Confianza:</span>
                      <p className={`font-semibold ${getConfidenceColor(selectedAnalysis.confidence)}`}>
                        {selectedAnalysis.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-slate-300 font-medium mb-2">Resumen</h3>
                      <p className="text-slate-100">{selectedAnalysis.summary}</p>
                    </div>

                    <div>
                      <h3 className="text-slate-300 font-medium mb-2">Análisis Detallado</h3>
                      <p className="text-slate-200 text-sm leading-relaxed">{selectedAnalysis.details}</p>
                    </div>

                    <div>
                      <h3 className="text-slate-300 font-medium mb-2">Recomendaciones</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                            <span className="text-slate-200 text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedAnalysis.followUp && (
                      <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-3">
                        <h3 className="text-blue-400 font-medium mb-1 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Seguimiento Requerido
                        </h3>
                        <p className="text-blue-300 text-sm">{selectedAnalysis.followUp}</p>
                      </div>
                    )}

                    {selectedAnalysis.status === 'error' && (
                      <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                        <h3 className="text-red-400 font-medium mb-1 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Acción Inmediata Requerida
                        </h3>
                        <p className="text-red-300 text-sm">Este análisis requiere atención médica inmediata.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">Selecciona un Análisis</h3>
                <p className="text-slate-400">Elige un análisis de la lista para ver los detalles completos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}