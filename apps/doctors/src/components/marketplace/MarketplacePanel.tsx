'use client'

import { useState } from 'react'
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Briefcase,
  Map,
  List
} from 'lucide-react'
import { LeafletMap } from './LeafletMap'
import { useRealDoctors } from '@/hooks/useRealDoctors'
import { MarketplaceJobOffer, MarketplaceDoctor, ARGENTINE_PROVINCES } from '@/types/marketplace'
import { MEDICAL_SPECIALTIES } from '@autamedica/types'

export function MarketplacePanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<MarketplaceJobOffer | MarketplaceDoctor | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'applications'>('date')

  const { doctors, loading: doctorsLoading, error: doctorsError } = useRealDoctors()

  // Mock job offers (en una implementación real vendría de una API)
  const jobOffers: MarketplaceJobOffer[] = [
    {
      id: '1',
      title: 'Cardiólogo - Hospital Italiano',
      specialty: 'Cardiología',
      hospital: 'Hospital Italiano',
      location: 'Buenos Aires',
      type: 'full-time',
      salary: { min: 150000, max: 250000, currency: 'ARS' },
      urgent: true,
      description: 'Buscamos cardiólogo con experiencia en procedimientos invasivos.',
      status: 'active'
    },
    {
      id: '2',
      title: 'Pediatra - Sanatorio Otamendi',
      specialty: 'Pediatría',
      hospital: 'Sanatorio Otamendi',
      location: 'Buenos Aires',
      type: 'part-time',
      salary: { min: 80000, max: 120000, currency: 'ARS' },
      urgent: false,
      description: 'Pediatra para guardias nocturnas y fines de semana.',
      status: 'active'
    }
  ]

  const filteredJobs = jobOffers.filter(job => {
    const matchesSearch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = selectedSpecialty === 'all' || job.specialty === selectedSpecialty
    const matchesLocation = selectedLocation === 'all' || job.location.province === selectedLocation
    const matchesType = selectedType === 'all' || job.type === selectedType
    const matchesUrgent = !showUrgentOnly || job.urgent

    return matchesSearch && matchesSpecialty && matchesLocation && matchesType && matchesUrgent
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'salary':
        return b.salary.max - a.salary.max
      case 'applications':
        return b.applicationsCount - a.applicationsCount
      case 'date':
      default:
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    }
  })

  const formatSalary = (job: MarketplaceJobOffer) => {
    const { min, max, currency, period } = job.salary
    if (currency === 'ARS') {
      return `$${min.toLocaleString('es-AR')} - $${max.toLocaleString('es-AR')}/${period}`
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}/${period}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  const handleItemSelect = (item: MarketplaceJobOffer | MarketplaceDoctor) => {
    setSelectedItem(item)
  }

  return (
    <div className="h-full bg-[#101d32] text-slate-100">
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Marketplace Médico</h1>
              <p className="text-sm text-slate-400">Encuentra trabajo médico en Argentina</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="flex h-[calc(100%-100px)]">
          {/* Panel lateral de filtros en vista mapa */}
          <div className="w-80 border-r border-slate-800/60 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar trabajos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filtros */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Especialidad</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todas las especialidades</option>
                    {Object.values(MEDICAL_SPECIALTIES).map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Provincia</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todas las provincias</option>
                    {ARGENTINE_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de trabajo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="full-time">Tiempo completo</option>
                    <option value="part-time">Medio tiempo</option>
                    <option value="contract">Contrato</option>
                    <option value="locum">Locum tenens</option>
                    <option value="remote">Remoto</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent-only"
                    checked={showUrgentOnly}
                    onChange={(e) => setShowUrgentOnly(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="urgent-only" className="text-sm text-slate-300">
                    Solo urgentes
                  </label>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
                <h3 className="text-sm font-medium text-slate-100 mb-2">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Total trabajos:</span>
                    <p className="text-slate-100 font-semibold">{filteredJobs.length}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Urgentes:</span>
                    <p className="text-red-400 font-semibold">{filteredJobs.filter(j => j.urgent).length}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Remotos:</span>
                    <p className="text-blue-400 font-semibold">{filteredJobs.filter(j => j.remote).length}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nuevos hoy:</span>
                    <p className="text-emerald-400 font-semibold">
                      {filteredJobs.filter(j => {
                        const today = new Date()
                        const jobDate = new Date(j.publishedDate)
                        return today.toDateString() === jobDate.toDateString()
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa interactivo */}
          <div className="flex-1 p-4">
            <LeafletMap
              jobs={filteredJobs}
              doctors={doctors}
              selectedItem={selectedItem?.id}
              onItemSelect={handleItemSelect}
              filters={{
                specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
                location: selectedLocation !== 'all' ? selectedLocation : undefined,
                urgent: showUrgentOnly
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100%-100px)]">
          {/* Lista de trabajos */}
          <div className="w-1/2 border-r border-slate-800/60 p-4">
            {/* Controles de lista */}
            <div className="mb-4 space-y-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar trabajos médicos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-2 overflow-x-auto">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Todas</option>
                  {Object.values(MEDICAL_SPECIALTIES).slice(0, 5).map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    showUrgentOnly
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Urgentes
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'salary' | 'applications')}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg text-slate-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="date">Más recientes</option>
                  <option value="salary">Mejor pagados</option>
                  <option value="applications">Más populares</option>
                </select>
              </div>
            </div>

            {/* Lista de trabajos */}
            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {sortedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleItemSelect(job)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === job.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-slate-100">{job.title}</h3>
                      <p className="text-sm text-slate-400">{job.company}</p>
                    </div>
                    {job.urgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location.city}, {job.location.province}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.type === 'full-time' ? 'Tiempo completo' :
                       job.type === 'part-time' ? 'Medio tiempo' :
                       job.type === 'contract' ? 'Contrato' :
                       job.type === 'locum' ? 'Locum tenens' : 'Remoto'}
                    </span>
                    {job.remote && (
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                        Remoto
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-bold text-emerald-400">
                        {formatSalary(job)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job.applicationsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {job.viewsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(job.publishedDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles del trabajo */}
          <div className="w-1/2 p-6">
            {selectedItem && 'title' in selectedItem ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">{selectedItem.title}</h2>
                      <p className="text-slate-400">{selectedItem.company}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{selectedItem.location.city}, {selectedItem.location.province}</span>
                      </div>
                    </div>
                    {selectedItem.urgent && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                      <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                      <p className="text-sm text-slate-400">Salario</p>
                      <p className="text-slate-100 font-medium">{formatSalary(selectedItem)}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                      <Briefcase className="w-5 h-5 text-blue-400 mb-2" />
                      <p className="text-sm text-slate-400">Tipo</p>
                      <p className="text-slate-100 font-medium">{selectedItem.type}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                      <Users className="w-5 h-5 text-purple-400 mb-2" />
                      <p className="text-sm text-slate-400">Aplicaciones</p>
                      <p className="text-slate-100 font-medium">{selectedItem.applicationsCount}</p>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                      <Clock className="w-5 h-5 text-amber-400 mb-2" />
                      <p className="text-sm text-slate-400">Publicado</p>
                      <p className="text-slate-100 font-medium">{getTimeAgo(selectedItem.publishedDate)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">{selectedItem.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Requisitos</h3>
                  <ul className="space-y-2">
                    {selectedItem.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span className="text-slate-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">Beneficios</h3>
                  <ul className="space-y-2">
                    {selectedItem.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <span className="text-slate-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Aplicar ahora
                  </button>
                  <button className="border border-slate-600 hover:bg-slate-800/40 text-slate-300 font-medium py-3 px-4 rounded-lg transition-colors">
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Selecciona un trabajo</h3>
                  <p className="text-slate-400">
                    Elige una oferta de trabajo de la lista para ver los detalles completos
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}