'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Users, Star, DollarSign, Clock, Loader } from 'lucide-react'
import { MarketplaceJobOffer, MarketplaceDoctor } from '@/types/marketplace'

// Dynamic import para evitar problemas de SSR con Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const MarkerClusterGroup = dynamic(
  () => import('react-leaflet').then(() =>
    import('react-leaflet-cluster').then(mod => mod.default)
  ),
  { ssr: false }
)

interface LeafletMapProps {
  jobs: MarketplaceJobOffer[]
  doctors: MarketplaceDoctor[]
  selectedItem?: string
  onItemSelect: (item: MarketplaceJobOffer | MarketplaceDoctor) => void
  filters?: {
    specialty?: string
    location?: string
    urgent?: boolean
  }
}

export function LeafletMap({ jobs, doctors, selectedItem, onItemSelect, filters }: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Cargar Leaflet dinámicamente para evitar problemas SSR
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet')

        // Fix para iconos de Leaflet en Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        })

        setLeafletLoaded(true)
      } catch (error) {
        logger.error('Error loading Leaflet:', error)
      }
    }

    loadLeaflet()
  }, [])

  const createCustomIcon = (type: 'job' | 'doctor', urgent: boolean = false) => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')

    const color = urgent ? '#ef4444' : type === 'job' ? '#3b82f6' : '#10b981'
    const size = urgent ? 35 : 25

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
import { logger } from '@autamedica/shared';
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${size < 30 ? '12px' : '14px'};
          font-weight: bold;
        ">
          ${type === 'job' ? '💼' : '👨‍⚕️'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }

  const formatSalary = (job: MarketplaceJobOffer) => {
    const { min, max, currency, period } = job.salary
    if (currency === 'ARS') {
      return `$${min.toLocaleString('es-AR')} - $${max.toLocaleString('es-AR')}/${period}`
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}/${period}`
  }

  const formatHourlyRate = (doctor: MarketplaceDoctor) => {
    const { amount, currency } = doctor.hourlyRate
    if (currency === 'ARS') {
      return `$${amount.toLocaleString('es-AR')}/hora`
    }
    return `${currency} ${amount.toLocaleString()}/hora`
  }

  if (!isClient || !leafletLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-900 rounded-lg">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-300">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  // Centro de Argentina (Buenos Aires)
  const center: [number, number] = [-34.6037, -58.3816]

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-700">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="leaflet-tile-layer"
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {/* Marcadores de trabajos */}
          {jobs.map((job) => (
            <Marker
              key={`job-${job.id}`}
              position={[job.location.coordinates.lat, job.location.coordinates.lng]}
              icon={createCustomIcon('job', job.urgent)}
              eventHandlers={{
                click: () => onItemSelect(job),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">{job.title}</h3>
                    {job.urgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs mb-2">{job.company}</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{job.location.city}, {job.location.province}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-700">{formatSalary(job)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span>{job.applicationsCount} aplicaciones</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onItemSelect(job)}
                    className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-2 px-3 rounded transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de médicos */}
          {doctors.map((doctor) => (
            <Marker
              key={`doctor-${doctor.id}`}
              position={[doctor.location.coordinates.lat, doctor.location.coordinates.lng]}
              icon={createCustomIcon('doctor', doctor.isUrgentAvailable)}
              eventHandlers={{
                click: () => onItemSelect(doctor),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">{doctor.name}</h3>
                    {doctor.isOnline && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                        En línea
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs mb-2">{doctor.specialties.join(', ')}</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{doctor.location.city}, {doctor.location.province}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium">{doctor.rating}/5 ({doctor.totalJobs} trabajos)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-700">{formatHourlyRate(doctor)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{doctor.experience} años experiencia</span>
                    </div>
                  </div>

                  {doctor.availableForHiring && (
                    <button
                      onClick={() => onItemSelect(doctor)}
                      className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded transition-colors"
                    >
                      Contactar médico
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white border border-slate-300 rounded-lg p-3 shadow-lg">
        <h4 className="text-slate-800 font-medium text-sm mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-slate-700">Ofertas urgentes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-slate-700">Ofertas disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-slate-700">Médicos disponibles</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="absolute top-4 right-4 bg-white border border-slate-300 rounded-lg p-3 shadow-lg">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{jobs.length}</div>
            <div className="text-slate-600">Trabajos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{jobs.filter(j => j.urgent).length}</div>
            <div className="text-slate-600">Urgentes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{doctors.length}</div>
            <div className="text-slate-600">Médicos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{doctors.filter(d => d.isOnline).length}</div>
            <div className="text-slate-600">En línea</div>
          </div>
        </div>
      </div>

      {/* CSS personalizado para popups */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }

        .leaflet-popup-tip {
          background: white;
        }

        .custom-marker {
          border: none !important;
          background: transparent !important;
        }

        .leaflet-container {
          background: #1e293b;
        }

        .leaflet-tile {
          filter: brightness(0.8) contrast(1.1);
        }
      `}</style>
    </div>
  )
}