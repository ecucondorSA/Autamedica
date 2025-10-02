/**
 * IntegratedReproductiveHealthHub - Versión con integraciones reales
 *
 * Este componente integra:
 * 1. Especialistas reales desde Supabase
 * 2. Sistema de citas con validación
 * 3. Geolocalización de centros de salud
 * 4. Chat médico asíncrono con Realtime
 */

'use client';

import { useState } from 'react';
import {
  Heart,
  Shield,
  FileText,
  AlertCircle,
  Phone,
  Video,
  Info,
  MapPin,
  MessageSquare,
  Calendar,
  Loader2
} from 'lucide-react';

// Hooks personalizados
import { useReproductiveHealthSpecialists } from '@/hooks/useReproductiveHealthSpecialists';
import { useReproductiveHealthAppointments } from '@/hooks/useReproductiveHealthAppointments';
import { useHealthCentersGeolocation } from '@/hooks/useHealthCentersGeolocation';
import { useMedicalChats } from '@/hooks/useMedicalChat';

// Componentes
import { ReproductiveHealthHub } from './ReproductiveHealthHub';

interface IntegratedReproductiveHealthHubProps {
  patientId: string;
  className?: string;
}

type TabId = 'overview' | 'rights' | 'procedures' | 'doctors' | 'support' | 'centers' | 'chat';

export function IntegratedReproductiveHealthHub({
  patientId,
  className = ''
}: IntegratedReproductiveHealthHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);

  // Hooks para datos reales
  const {
    specialists,
    isLoading: loadingSpecialists,
    refetch: refetchSpecialists
  } = useReproductiveHealthSpecialists({
    availableOnly: false,
    certifiedOnly: true
  });

  const {
    appointments,
    isLoading: loadingAppointments,
    createAppointment
  } = useReproductiveHealthAppointments({
    patientId,
    upcoming: true
  });

  const {
    centers,
    isLoading: loadingCenters,
    userLocation,
    requestLocation
  } = useHealthCentersGeolocation({
    autoDetectLocation: false
  });

  const {
    chats,
    isLoading: loadingChats,
    createChat
  } = useMedicalChats({
    patientId,
    activeOnly: true
  });

  const handleRequestConsultation = async (specialistId?: string) => {
    if (!specialistId && specialists.length > 0) {
      // Seleccionar primer especialista disponible
      const availableSpecialist = specialists.find(s => s.availability_status === 'available');
      specialistId = availableSpecialist?.id || specialists[0].id;
    }

    if (specialistId) {
      setSelectedSpecialist(specialistId);
      setShowAppointmentModal(true);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedSpecialist) return;

    const result = await createAppointment({
      patient_id: patientId,
      specialist_id: selectedSpecialist,
      consultation_type: 'information',
      modality: 'video_call',
      scheduled_at: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min from now
      duration_minutes: 30
    });

    if (result.success) {
      setShowAppointmentModal(false);
      alert('¡Cita agendada exitosamente!');
    } else {
      alert('Error al agendar cita. Inténtalo de nuevo.');
    }
  };

  const handleStartChat = async (specialistId: string) => {
    const result = await createChat({
      patient_id: patientId,
      specialist_id: specialistId,
      subject: 'Consulta sobre IVE/ILE',
      is_urgent: false
    });

    if (result.success && result.chatId) {
      // Navegar al chat o abrir modal
      setActiveTab('chat');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con información y acciones rápidas */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Heart className="h-7 w-7 text-purple-300" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              Centro de Salud Reproductiva
            </h1>
            <p className="text-purple-100 text-sm leading-relaxed mb-4">
              Información confiable sobre IVE/ILE según la Ley 27.610.
              {specialists.length > 0 && (
                <span className="block mt-1 font-semibold text-purple-200">
                  {specialists.filter(s => s.availability_status === 'available').length} especialistas disponibles ahora
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleRequestConsultation()}
                disabled={loadingSpecialists || specialists.length === 0}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                {loadingSpecialists ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Consulta Médica Ahora
              </button>
              <a
                href="tel:08003454266"
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                <Phone className="h-4 w-4" />
                0800-345-4266
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación extendidos */}
      <div className="border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview' as TabId, label: 'Info General', icon: Info },
            { id: 'rights' as TabId, label: 'Tus Derechos', icon: Shield },
            { id: 'procedures' as TabId, label: 'Procedimientos', icon: FileText },
            { id: 'doctors' as TabId, label: 'Especialistas', icon: Video },
            { id: 'centers' as TabId, label: 'Centros Cercanos', icon: MapPin },
            { id: 'chat' as TabId, label: 'Chat Médico', icon: MessageSquare },
            { id: 'support' as TabId, label: 'Apoyo', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            const unreadChats = tab.id === 'chat' ? chats.reduce((sum, chat) => sum + chat.unread_count, 0) : 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition relative ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {unreadChats > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadChats}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className="space-y-6">
        {activeTab === 'doctors' && (
          <DoctorsTabIntegrated
            specialists={specialists}
            isLoading={loadingSpecialists}
            onRequestCall={handleRequestConsultation}
            onStartChat={handleStartChat}
          />
        )}

        {activeTab === 'centers' && (
          <CentersTabIntegrated
            centers={centers}
            isLoading={loadingCenters}
            userLocation={userLocation}
            onRequestLocation={requestLocation}
          />
        )}

        {activeTab === 'chat' && (
          <ChatTabIntegrated
            chats={chats}
            isLoading={loadingChats}
            patientId={patientId}
          />
        )}

        {/* Los demás tabs usan el componente original */}
        {!['doctors', 'centers', 'chat'].includes(activeTab) && (
          <ReproductiveHealthHub
            onRequestConsultation={() => handleRequestConsultation()}
          />
        )}
      </div>

      {/* Modal de agendar cita */}
      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onCreate={handleCreateAppointment}
          specialistId={selectedSpecialist}
        />
      )}
    </div>
  );
}

// Componente de Tab de Especialistas con datos reales
function DoctorsTabIntegrated({
  specialists,
  isLoading,
  onRequestCall,
  onStartChat
}: any) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-3 text-white">Cargando especialistas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Especialistas Certificados</h2>
        <p className="text-purple-100 text-sm mb-4">
          Todos nuestros especialistas están certificados en IVE/ILE según la Ley 27.610
        </p>
      </div>

      <div className="space-y-4">
        {specialists.map((doctor: any) => (
          <div key={doctor.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {doctor.profile_image_url ? (
                    <img
                      src={doctor.profile_image_url}
                      alt={`${doctor.first_name} ${doctor.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-purple-400 font-bold text-lg">
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {doctor.first_name} {doctor.last_name}
                  </h4>
                  <p className="text-sm text-white/70 mb-1">
                    {getSpecialtyLabel(doctor.specialty)}
                  </p>
                  <p className="text-xs text-white/50 mb-2">{doctor.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>⭐ {doctor.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{doctor.total_consultations} consultas</span>
                    <span>•</span>
                    <span>{doctor.years_of_experience} años exp.</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {doctor.availability_status === 'available' ? (
                  <>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Disponible
                    </span>
                    <button
                      onClick={() => onRequestCall(doctor.id)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <Video className="h-3 w-3" />
                      Llamar
                    </button>
                    <button
                      onClick={() => onStartChat(doctor.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">
                    {doctor.availability_status === 'busy' ? 'Ocupado' : 'No disponible'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Tab de Centros con geolocalización
function CentersTabIntegrated({
  centers,
  isLoading,
  userLocation,
  onRequestLocation
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Centros de Salud Cercanos</h2>
        <p className="text-blue-100 text-sm mb-4">
          Encuentra centros que ofrecen servicios IVE/ILE cerca de ti
        </p>
        {!userLocation && (
          <button
            onClick={onRequestLocation}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            <MapPin className="h-4 w-4" />
            Activar Geolocalización
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-3 text-white">Buscando centros cercanos...</span>
        </div>
      ) : centers.length === 0 ? (
        <div className="text-center py-12 text-white/70">
          No se encontraron centros cercanos. Intenta activar la geolocalización.
        </div>
      ) : (
        <div className="space-y-4">
          {centers.map((center: any) => (
            <div key={center.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{center.name}</h4>
                  <p className="text-sm text-white/70 mb-2">{getCenterTypeLabel(center.type)}</p>
                  <p className="text-xs text-white/50 mb-2">
                    {formatAddress(center.address)}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {center.offers_medication_method && (
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        Método medicamentos
                      </span>
                    )}
                    {center.offers_surgical_method && (
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        Método quirúrgico
                      </span>
                    )}
                    {center.accepts_walk_ins && (
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        Sin cita previa
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {center.distance_km > 0 && (
                    <div className="text-white font-bold mb-1">
                      {center.distance_km.toFixed(1)} km
                    </div>
                  )}
                  <a
                    href={`tel:${center.phone}`}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    {center.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de Tab de Chat
function ChatTabIntegrated({
  chats,
  isLoading,
  patientId
}: any) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        <span className="ml-3 text-white">Cargando chats...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Chats Médicos</h2>
        <p className="text-green-100 text-sm">
          Comunícate de forma asíncrona con especialistas
        </p>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-12 text-white/70">
          No tienes chats activos. Inicia uno desde la sección de Especialistas.
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat: any) => (
            <div key={chat.id} className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{chat.specialist_name}</h4>
                    {chat.is_urgent && (
                      <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded">
                        Urgente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mb-1">{chat.subject}</p>
                  <p className="text-xs text-white/50 line-clamp-1">
                    {chat.last_message_content}
                  </p>
                </div>
                <div className="text-right">
                  {chat.unread_count > 0 && (
                    <span className="bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {chat.unread_count}
                    </span>
                  )}
                  <span className="text-xs text-white/50 mt-1 block">
                    {getTimeAgo(chat.last_message_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Modal de Agendar Cita
function AppointmentModal({ onClose, onCreate, specialistId }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Agendar Consulta</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            ¿Deseas agendar una videoconsulta para los próximos 30 minutos?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCreate}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Confirmar Cita
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getSpecialtyLabel(specialty: string): string {
  const labels: Record<string, string> = {
    gynecology: 'Ginecología',
    general_medicine: 'Medicina General',
    psychology: 'Psicología Perinatal',
    social_work: 'Trabajo Social',
    nursing: 'Enfermería'
  };
  return labels[specialty] || specialty;
}

function getCenterTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    public_hospital: 'Hospital Público',
    health_center: 'Centro de Salud',
    caps: 'CAPS',
    clinic: 'Clínica Privada',
    ngo: 'ONG'
  };
  return labels[type] || type;
}

function formatAddress(address: any): string {
  if (!address) return '';
  const parts = [address.street, address.number, address.city, address.state].filter(Boolean);
  return parts.join(', ');
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
}
