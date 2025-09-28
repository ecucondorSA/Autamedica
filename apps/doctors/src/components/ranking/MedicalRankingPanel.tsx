'use client'

import { useState } from 'react'
import { Award, Star, TrendingUp, Users, Clock, Eye, ThumbsUp, FileText, Medal, Crown, Trophy } from 'lucide-react'

interface RankingMetric {
  id: string
  category: 'patient-satisfaction' | 'clinical-outcomes' | 'efficiency' | 'collaboration'
  name: string
  value: number
  maxValue: number
  trend: 'up' | 'down' | 'stable'
  percentile: number
  description: string
}

interface Doctor {
  id: string
  name: string
  specialty: string
  overallScore: number
  rank: number
  avatar?: string
  metrics: RankingMetric[]
  badges: Badge[]
  totalPatients: number
  yearsExperience: number
}

interface Badge {
  id: string
  name: string
  icon: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  earnedAt: string
  description: string
}

export function MedicalRankingPanel() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const currentUser: Doctor = {
    id: 'current',
    name: 'Dr. Eduardo Martínez',
    specialty: 'Cardiología',
    overallScore: 94.5,
    rank: 3,
    totalPatients: 247,
    yearsExperience: 8,
    badges: [
      {
        id: 'b1',
        name: 'Excelencia Clínica',
        icon: '🏆',
        level: 'gold',
        earnedAt: '2024-12-15T00:00:00Z',
        description: '95%+ de satisfacción del paciente por 6 meses consecutivos'
      },
      {
        id: 'b2',
        name: 'Innovador Digital',
        icon: '💡',
        level: 'silver',
        earnedAt: '2024-11-20T00:00:00Z',
        description: 'Adopción temprana de herramientas de IA médica'
      },
      {
        id: 'b3',
        name: 'Mentor Reconocido',
        icon: '👨‍🏫',
        level: 'bronze',
        earnedAt: '2024-10-10T00:00:00Z',
        description: 'Formación de 5+ residentes con calificación sobresaliente'
      }
    ],
    metrics: [
      {
        id: 'm1',
        category: 'patient-satisfaction',
        name: 'Satisfacción del Paciente',
        value: 96,
        maxValue: 100,
        trend: 'up',
        percentile: 89,
        description: 'Evaluación promedio de satisfacción basada en encuestas post-consulta'
      },
      {
        id: 'm2',
        category: 'clinical-outcomes',
        name: 'Resultados Clínicos',
        value: 93,
        maxValue: 100,
        trend: 'stable',
        percentile: 85,
        description: 'Medición de efectividad en tratamientos y diagnósticos precisos'
      },
      {
        id: 'm3',
        category: 'efficiency',
        name: 'Eficiencia Operativa',
        value: 88,
        maxValue: 100,
        trend: 'up',
        percentile: 76,
        description: 'Tiempo promedio de consulta, adherencia a horarios y productividad'
      },
      {
        id: 'm4',
        category: 'collaboration',
        name: 'Colaboración Interdisciplinaria',
        value: 91,
        maxValue: 100,
        trend: 'down',
        percentile: 82,
        description: 'Trabajo en equipo, comunicación con colegas y participación en casos complejos'
      }
    ]
  }

  const topDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dra. Carmen Silva',
      specialty: 'Neurología',
      overallScore: 97.2,
      rank: 1,
      totalPatients: 312,
      yearsExperience: 12,
      badges: [
        { id: 'b1', name: 'Líder Nacional', icon: '👑', level: 'platinum', earnedAt: '2024-12-01T00:00:00Z', description: 'Top 1 en ranking nacional' },
        { id: 'b2', name: 'Investigadora Destacada', icon: '🔬', level: 'gold', earnedAt: '2024-11-15T00:00:00Z', description: '10+ publicaciones científicas este año' }
      ],
      metrics: []
    },
    {
      id: '2',
      name: 'Dr. Alejandro Ruiz',
      specialty: 'Cirugía General',
      overallScore: 95.8,
      rank: 2,
      totalPatients: 189,
      yearsExperience: 15,
      badges: [
        { id: 'b3', name: 'Cirujano de Élite', icon: '🏥', level: 'gold', earnedAt: '2024-12-10T00:00:00Z', description: '99%+ tasa de éxito quirúrgico' }
      ],
      metrics: []
    },
    currentUser,
    {
      id: '4',
      name: 'Dra. Patricia Morales',
      specialty: 'Pediatría',
      overallScore: 92.1,
      rank: 4,
      totalPatients: 445,
      yearsExperience: 9,
      badges: [
        { id: 'b4', name: 'Defensora Pediátrica', icon: '👶', level: 'silver', earnedAt: '2024-11-25T00:00:00Z', description: 'Excelencia en cuidado infantil' }
      ],
      metrics: []
    },
    {
      id: '5',
      name: 'Dr. Fernando López',
      specialty: 'Dermatología',
      overallScore: 90.7,
      rank: 5,
      totalPatients: 278,
      yearsExperience: 7,
      badges: [
        { id: 'b5', name: 'Innovador Dermatológico', icon: '✨', level: 'bronze', earnedAt: '2024-12-05T00:00:00Z', description: 'Adopción de tecnologías avanzadas' }
      ],
      metrics: []
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient-satisfaction': return <ThumbsUp className="w-4 h-4" />
      case 'clinical-outcomes': return <FileText className="w-4 h-4" />
      case 'efficiency': return <Clock className="w-4 h-4" />
      case 'collaboration': return <Users className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 transform rotate-180" />
      default: return <div className="w-3 h-3 rounded-full bg-slate-400" />
    }
  }

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'from-slate-200 to-slate-400 text-slate-800'
      case 'gold': return 'from-yellow-400 to-yellow-600 text-yellow-900'
      case 'silver': return 'from-slate-300 to-slate-500 text-slate-800'
      case 'bronze': return 'from-amber-600 to-amber-800 text-amber-100'
      default: return 'from-slate-600 to-slate-800 text-slate-100'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-slate-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-lg font-bold text-slate-400">#{rank}</span>
  }

  return (
    <div className="h-full bg-[#101d32] text-slate-100">
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Sistema de Ranking</h1>
              <p className="text-sm text-slate-400">Evaluación y reconocimiento del desempeño médico</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">#{currentUser.rank}</p>
              <p className="text-sm text-slate-400">Tu posición</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-100">{currentUser.overallScore}</p>
              <p className="text-sm text-slate-400">Puntuación</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-100px)]">
        {/* Panel de métricas personales */}
        <div className="w-1/2 border-r border-slate-800/60 p-6">
          <h2 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Tu Desempeño
          </h2>

          {/* Métricas principales */}
          <div className="space-y-4 mb-6">
            {currentUser.metrics.map((metric) => (
              <div key={metric.id} className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(metric.category)}
                    <span className="font-medium text-slate-100">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm text-slate-400">Top {100 - metric.percentile}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-100">{metric.value}</span>
                  <span className="text-sm text-slate-400">/{metric.maxValue}</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Badges/Logros */}
          <div>
            <h3 className="text-md font-medium text-slate-100 mb-3 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              Logros Recientes
            </h3>
            <div className="space-y-2">
              {currentUser.badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getBadgeColor(badge.level)} flex items-center justify-center text-lg`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">{badge.name}</p>
                    <p className="text-xs text-slate-400">{badge.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(badge.earnedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getBadgeColor(badge.level)}`}>
                      {badge.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de rankings */}
        <div className="w-1/2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Ranking General
            </h2>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos los médicos</option>
              <option value="cardiology">Cardiología</option>
              <option value="neurology">Neurología</option>
              <option value="surgery">Cirugía</option>
              <option value="pediatrics">Pediatría</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {topDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  doctor.id === currentUser.id
                    ? 'bg-amber-900/20 border-amber-700/40 ring-1 ring-amber-500/30'
                    : selectedDoctor?.id === doctor.id
                    ? 'bg-slate-800/60 border-slate-600'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRankIcon(doctor.rank)}
                    <div>
                      <h3 className="font-medium text-slate-100 flex items-center gap-2">
                        {doctor.name}
                        {doctor.id === currentUser.id && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                            TÚ
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-100">{doctor.overallScore}</p>
                    <p className="text-xs text-slate-400">puntos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {doctor.totalPatients} pacientes
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doctor.yearsExperience} años
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {doctor.badges.length} logros
                  </div>
                </div>

                {doctor.badges.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {doctor.badges.slice(0, 3).map((badge) => (
                      <div
                        key={badge.id}
                        className={`w-6 h-6 rounded bg-gradient-to-br ${getBadgeColor(badge.level)} flex items-center justify-center text-xs`}
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    ))}
                    {doctor.badges.length > 3 && (
                      <span className="text-xs text-slate-400 ml-1">+{doctor.badges.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedDoctor && selectedDoctor.id !== currentUser.id && (
            <div className="mt-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
              <h3 className="font-medium text-slate-100 mb-2">Perfil Detallado</h3>
              <p className="text-sm text-slate-400 mb-3">
                {selectedDoctor.name} es un especialista en {selectedDoctor.specialty} con {selectedDoctor.yearsExperience} años de experiencia.
                Ha atendido a {selectedDoctor.totalPatients} pacientes y mantiene una puntuación de {selectedDoctor.overallScore}.
              </p>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Ver perfil completo</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}