'use client';

import { useState } from 'react';
import {
  Heart,
  Shield,
  FileText,
  AlertCircle,
  Phone,
  Video,
  Clock,
  CheckCircle,
  Info,
  Scale,
  Users,
  MapPin,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Stethoscope,
  Calendar
} from 'lucide-react';

interface ReproductiveHealthHubProps {
  onRequestConsultation?: () => void;
  className?: string;
}

type TabId = 'overview' | 'rights' | 'procedures' | 'doctors' | 'support';

export function ReproductiveHealthHub({ onRequestConsultation, className = '' }: ReproductiveHealthHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showUrgentContact, setShowUrgentContact] = useState(false);

  const tabs = [
    { id: 'overview' as TabId, label: '¿Qué es la IVE?', icon: Info },
    { id: 'rights' as TabId, label: 'Mis Derechos Legales', icon: Shield },
    { id: 'procedures' as TabId, label: 'Métodos Disponibles', icon: FileText },
    { id: 'doctors' as TabId, label: 'Médicos Especializados', icon: Stethoscope },
    { id: 'support' as TabId, label: 'Acompañamiento Emocional', icon: Heart }
  ];

  const handleEmergencyCall = () => {
    setShowUrgentContact(true);
    if (onRequestConsultation) {
      onRequestConsultation();
    }
  };

  return (
    <div className={`w-full p-6 ${className}`}>
      {/* Header con información clave */}
      <div className="bg-gradient-to-br from-stone-50 to-white border-2 border-stone-300 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
              <Heart className="h-7 w-7 text-rose-600" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="heading-1 mb-2">
              Interrupción Voluntaria del Embarazo (IVE)
            </h1>
            <p className="text-body leading-relaxed mb-3">
              Acceso a información confiable, acompañamiento emocional y atención médica profesional
              para la interrupción del embarazo.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h3 className="heading-3 text-blue-900 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                ¿En qué consiste este servicio?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consulta médica gratuita y confidencial</li>
                <li>• Información sobre métodos disponibles (medicamentos o procedimiento quirúrgico)</li>
                <li>• Acompañamiento psicológico antes, durante y después</li>
                <li>• <strong>Sin necesidad de denuncia policial o autorización judicial</strong></li>
                <li>• Es tu derecho según la <strong>Ley 27.610</strong> (Argentina)</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEmergencyCall}
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-md"
              >
                <Video className="h-4 w-4" />
                Consulta Médica Ahora
              </button>
              <a
                href="tel:08003454266"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-md"
              >
                <Phone className="h-4 w-4" />
                Línea Nacional 0800-345-4266
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de urgencia */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">¿Necesitas atención urgente?</h3>
            <p className="text-red-800 text-sm mb-2">
              Si experimentas sangrado abundante, dolor intenso o fiebre alta, busca atención médica inmediata.
            </p>
            <button
              onClick={handleEmergencyCall}
              className="text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1 underline"
            >
              Contactar médico de emergencia <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-stone-300">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-stone-800 text-white border border-stone-800'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'rights' && <RightsTab />}
        {activeTab === 'procedures' && <ProceduresTab />}
        {activeTab === 'doctors' && <DoctorsTab onRequestCall={handleEmergencyCall} />}
        {activeTab === 'support' && <SupportTab />}
      </div>

      {/* Modal de contacto urgente */}
      {showUrgentContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-purple-500/30 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-900">Conectando con médico...</h3>
              <button
                onClick={() => setShowUrgentContact(false)}
                className="text-stone-700 hover:text-stone-900"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-stone-700">
                <Clock className="h-5 w-5 animate-spin" />
                <span>Buscando especialista disponible</span>
              </div>
              <p className="text-stone-700 text-sm">
                Estamos conectándote con un profesional de salud especializado en salud reproductiva
                que podrá responder todas tus preguntas de forma confidencial.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Qué es IVE/ILE */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-md">
        <div className="flex items-start gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-stone-700" />
          <div>
            <h2 className="heading-2 mb-2">¿Qué es la IVE/ILE?</h2>
            <p className="text-body leading-relaxed">
              La <strong className="text-stone-900">Interrupción Voluntaria del Embarazo (IVE)</strong> es
              un derecho garantizado por la Ley 27.610 hasta la semana 14 de gestación.
            </p>
            <p className="text-body leading-relaxed mt-2">
              La <strong className="text-stone-900">Interrupción Legal del Embarazo (ILE)</strong> es
              el derecho a interrumpir el embarazo en cualquier momento si fue producto de una violación
              o si está en riesgo la vida o salud de la persona gestante.
            </p>
          </div>
        </div>
      </div>

      {/* Información clave */}
      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          icon={<CheckCircle className="h-5 w-5 text-green-400" />}
          title="Es legal y gratuito"
          description="En todos los hospitales públicos y obras sociales de Argentina"
          color="green"
        />
        <InfoCard
          icon={<Shield className="h-5 w-5 text-blue-400" />}
          title="Es confidencial"
          description="Tu privacidad está protegida por ley. No se requiere autorización de terceros"
          color="blue"
        />
        <InfoCard
          icon={<Clock className="h-5 w-5 text-yellow-400" />}
          title="Atención inmediata"
          description="El sistema de salud debe darte una respuesta en máximo 10 días corridos"
          color="yellow"
        />
        <InfoCard
          icon={<Heart className="h-5 w-5 text-rose-600" />}
          title="Acompañamiento integral"
          description="Tienes derecho a consejería pre y post intervención"
          color="rose"
        />
      </div>
    </div>
  );
}

function RightsTab() {
  const rights = [
    {
      title: 'Acceso libre y gratuito',
      description: 'En todo el sistema de salud (público, obras sociales y prepagas)',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    {
      title: 'Sin autorización de terceros',
      description: 'No necesitas permiso de pareja, padres ni tutores (a partir de los 16 años)',
      icon: <Shield className="h-5 w-5 text-blue-400" />
    },
    {
      title: 'Confidencialidad absoluta',
      description: 'Toda la información es privada y protegida por secreto médico',
      icon: <FileText className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Información clara y completa',
      description: 'Derecho a recibir toda la información sobre procedimientos, riesgos y cuidados',
      icon: <Info className="h-5 w-5 text-yellow-400" />
    },
    {
      title: 'Atención respetuosa',
      description: 'Sin discriminación, maltrato ni violencia obstétrica',
      icon: <Heart className="h-5 w-5 text-rose-600" />
    },
    {
      title: 'Objeción de conciencia limitada',
      description: 'Si un médico objeta, debe derivarte inmediatamente a otro profesional',
      icon: <Users className="h-5 w-5 text-amber-600" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Scale className="h-6 w-6 text-blue-700 flex-shrink-0" />
          <div>
            <h2 className="heading-2 mb-2">Ley 27.610 - Tus Derechos</h2>
            <p className="text-blue-800 text-sm leading-relaxed">
              Sancionada el 30 de diciembre de 2020, esta ley garantiza el acceso a la interrupción
              voluntaria del embarazo y a la atención postaborto en todo el país.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rights.map((right, index) => (
          <div key={index} className="bg-white border border-stone-200 shadow-md rounded-lg p-4">
            <div className="flex items-start gap-3">
              {right.icon}
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">{right.title}</h3>
                <p className="text-stone-700 text-sm">{right.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deberes de los médicos */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-400" />
          Deberes del Personal de Salud
        </h3>
        <ul className="space-y-3 text-sm text-blue-900">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Brindar información completa, clara y en lenguaje comprensible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Garantizar atención en máximo 10 días corridos desde la solicitud</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>No pueden negarse si hay riesgo para la vida o salud de la persona</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Si objetan por conciencia, deben derivar inmediatamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Respetar la confidencialidad y dignidad de la persona</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function ProceduresTab() {
  const methods = [
    {
      name: 'Método con medicamentos',
      description: 'Mifepristona + Misoprostol o solo Misoprostol',
      weeks: 'Hasta semana 12-14',
      process: 'Ambulatorio, en casa con seguimiento médico',
      duration: '4-6 horas (proceso completo puede llevar días)',
      color: 'purple'
    },
    {
      name: 'Método instrumental (AMEU)',
      description: 'Aspiración Manual Endouterina',
      weeks: 'Hasta semana 12-14',
      process: 'Procedimiento en consultorio o quirófano',
      duration: '10-15 minutos',
      color: 'blue'
    }
  ];

  const risks = [
    'Sangrado (normal hasta 2 semanas)',
    'Cólicos similares a menstruación',
    'Náuseas o vómitos',
    'Dolor de cabeza',
    'Fiebre leve (primeras 24hs)'
  ];

  const warnings = [
    'Sangrado muy abundante (más de 2 toallas por hora durante 2 horas)',
    'Fiebre alta (más de 38°C) después de 24 horas',
    'Dolor muy intenso que no calma con analgésicos',
    'Flujo con mal olor',
    'Mareos intensos o desmayos'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Métodos Disponibles</h2>
        <div className="space-y-4">
          {methods.map((method, index) => (
            <div key={index} className="bg-stone-50 border-2 border-stone-300 rounded-lg p-4">
              <h3 className="font-bold text-stone-900 mb-2">{method.name}</h3>
              <div className="space-y-2 text-sm text-stone-700">
                <p><strong className="text-stone-900">Descripción:</strong> {method.description}</p>
                <p><strong className="text-stone-900">Período:</strong> {method.weeks}</p>
                <p><strong className="text-stone-900">Proceso:</strong> {method.process}</p>
                <p><strong className="text-stone-900">Duración:</strong> {method.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Qué esperar */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-yellow-600" />
          Qué esperar (efectos normales)
        </h3>
        <ul className="space-y-2 text-sm text-yellow-900">
          {risks.map((risk, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cuándo buscar ayuda */}
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Cuándo buscar atención médica urgente
        </h3>
        <ul className="space-y-2 text-sm text-red-900">
          {warnings.map((warning, index) => (
            <li key={index} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full bg-red-600 hover:bg-red-500 text-stone-900 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Contactar médico de emergencia
        </button>
      </div>

      {/* Cuidados post-procedimiento */}
      <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-600" />
          Cuidados posteriores
        </h3>
        <div className="space-y-3 text-sm text-green-900">
          <p>• Descansar cuando lo necesites</p>
          <p>• Evitar relaciones sexuales por 1-2 semanas</p>
          <p>• No usar tampones hasta que pase el sangrado</p>
          <p>• Control médico a los 10-15 días</p>
          <p>• La menstruación vuelve en 4-6 semanas aproximadamente</p>
          <p>• Puedes quedar embarazada nuevamente muy pronto, consulta sobre anticoncepción</p>
        </div>
      </div>
    </div>
  );
}

function DoctorsTab({ onRequestCall }: { onRequestCall: () => void }) {
  const specialists = [
    {
      name: 'Dra. María González',
      specialty: 'Ginecología y Salud Reproductiva',
      available: true,
      rating: 4.9,
      consultations: 156
    },
    {
      name: 'Dr. Carlos Rodríguez',
      specialty: 'Medicina General - Salud Sexual',
      available: true,
      rating: 4.8,
      consultations: 203
    },
    {
      name: 'Dra. Ana Martínez',
      specialty: 'Psicología Perinatal',
      available: false,
      rating: 4.9,
      consultations: 189
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-stone-50 border-2 border-stone-300 rounded-xl p-6">
        <h2 className="heading-2 mb-2">Consulta con Especialistas</h2>
        <p className="text-body mb-4">
          Conecta con profesionales de salud capacitados en IVE/ILE que resolverán todas tus dudas
          de forma confidencial y sin prejuicios.
        </p>
        <button
          onClick={onRequestCall}
          className="w-full btn-primary-ivory px-4 py-3 flex items-center justify-center gap-2"
        >
          <Video className="h-5 w-5" />
          Iniciar Videoconsulta Ahora
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-stone-900">Profesionales Disponibles</h3>
        {specialists.map((doctor, index) => (
          <div key={index} className="bg-white border border-stone-200 shadow-md rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-6 w-6 text-stone-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900">{doctor.name}</h4>
                  <p className="text-sm text-stone-700 mb-2">{doctor.specialty}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-900/50">
                    <span>⭐ {doctor.rating}</span>
                    <span>•</span>
                    <span>{doctor.consultations} consultas</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {doctor.available ? (
                  <>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Disponible
                    </span>
                    <button
                      onClick={onRequestCall}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-stone-900 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <Video className="h-3 w-3" />
                      Llamar
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">
                    No disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Qué preguntarle al médico */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Preguntas que puedes hacer:</h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>• ¿Cuál es el método más adecuado para mi situación?</li>
          <li>• ¿Qué puedo esperar durante y después del procedimiento?</li>
          <li>• ¿Cuánto tiempo tomará el proceso completo?</li>
          <li>• ¿Dónde se realizará el procedimiento?</li>
          <li>• ¿Necesito acompañante?</li>
          <li>• ¿Qué métodos anticonceptivos puedo usar después?</li>
          <li>• ¿Cuándo puedo retomar mis actividades normales?</li>
          <li>• ¿Qué señales de alerta debo vigilar?</li>
        </ul>
      </div>
    </div>
  );
}

function SupportTab() {
  const resources = [
    {
      name: 'Línea Nacional de Salud Sexual',
      contact: '0800-222-3444',
      description: 'Atención telefónica gratuita, anónima y confidencial',
      icon: <Phone className="h-5 w-5 text-green-400" />
    },
    {
      name: 'Consejería IVE/ILE',
      contact: '0800-345-4266 (0800-ELIGIENDO)',
      description: 'Orientación sobre tus derechos y acceso a servicios',
      icon: <Phone className="h-5 w-5 text-blue-400" />
    },
    {
      name: 'Socorristas en Red',
      contact: 'socorristasenred.org',
      description: 'Acompañamiento y contención durante todo el proceso',
      icon: <Heart className="h-5 w-5 text-rose-600" />
    },
    {
      name: 'Línea 144',
      contact: '144',
      description: 'Atención para víctimas de violencia de género (24hs)',
      icon: <Shield className="h-5 w-5 text-stone-700" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-6">
        <h2 className="heading-2 mb-2">No estás sola</h2>
        <p className="text-body">
          Existen múltiples organizaciones y líneas de apoyo disponibles para acompañarte
          en este proceso con información, contención emocional y asesoramiento legal.
        </p>
      </div>

      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white border border-stone-200 shadow-md rounded-xl p-4">
            <div className="flex items-start gap-3">
              {resource.icon}
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">{resource.name}</h3>
                <p className="text-stone-900 font-mono text-sm mb-2">{resource.contact}</p>
                <p className="text-stone-700 text-sm">{resource.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-stone-900/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Acompañamiento emocional */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded-xl p-6">
        <h3 className="heading-3 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-600" />
          Apoyo Emocional
        </h3>
        <p className="text-body mb-4">
          Es normal experimentar diferentes emociones. Tienes derecho a recibir acompañamiento
          psicológico antes, durante y después del proceso.
        </p>
        <button className="w-full btn-secondary-ivory px-4 py-2 text-sm flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Solicitar Apoyo Psicológico
        </button>
      </div>

      {/* Dónde realizarlo */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-400" />
          ¿Dónde puedo acceder?
        </h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>• Hospitales públicos de todo el país</li>
          <li>• Centros de salud y CAPS</li>
          <li>• Obras sociales (obligatorio por ley)</li>
          <li>• Empresas de medicina prepaga (obligatorio por ley)</li>
        </ul>
        <p className="mt-4 text-xs text-blue-700">
          Si te niegan el acceso, podés denunciar en el 0800-222-3444 o hacer la denuncia en línea
          en argentina.gob.ar/salud
        </p>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function InfoCard({ icon, title, description, color }: InfoCardProps) {
  return (
    <div className={`bg-${color}-600/10 border border-${color}-500/30 rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
          <p className="text-stone-700 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
