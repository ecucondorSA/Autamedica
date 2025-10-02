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
    { id: 'overview' as TabId, label: 'Información General', icon: Info },
    { id: 'rights' as TabId, label: 'Tus Derechos', icon: Shield },
    { id: 'procedures' as TabId, label: 'Procedimientos', icon: FileText },
    { id: 'doctors' as TabId, label: 'Conectar con Médico', icon: Stethoscope },
    { id: 'support' as TabId, label: 'Apoyo y Recursos', icon: Heart }
  ];

  const handleEmergencyCall = () => {
    setShowUrgentContact(true);
    if (onRequestConsultation) {
      onRequestConsultation();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con información clave */}
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
              Información confiable sobre Interrupción Voluntaria del Embarazo (IVE) y tus derechos
              según la Ley 27.610. Aquí encontrarás todo lo que necesitas saber y podrás conectar
              con profesionales de salud especializados.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEmergencyCall}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                <Video className="h-4 w-4" />
                Consulta Médica Ahora
              </button>
              <a
                href="tel:08003454266"
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                <Phone className="h-4 w-4" />
                Línea Nacional 0800-345-4266
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de urgencia */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-200 mb-1">¿Necesitas atención urgente?</h3>
            <p className="text-red-100 text-sm mb-2">
              Si experimentas sangrado abundante, dolor intenso o fiebre alta, busca atención médica inmediata.
            </p>
            <button
              onClick={handleEmergencyCall}
              className="text-red-300 hover:text-red-200 text-sm font-semibold flex items-center gap-1"
            >
              Contactar médico de emergencia <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
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
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Conectando con médico...</h3>
              <button
                onClick={() => setShowUrgentContact(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-purple-200">
                <Clock className="h-5 w-5 animate-spin" />
                <span>Buscando especialista disponible</span>
              </div>
              <p className="text-white/70 text-sm">
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
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">¿Qué es la IVE/ILE?</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              La <strong className="text-purple-300">Interrupción Voluntaria del Embarazo (IVE)</strong> es
              un derecho garantizado por la Ley 27.610 hasta la semana 14 de gestación.
            </p>
            <p className="text-white/70 text-sm leading-relaxed mt-2">
              La <strong className="text-pink-300">Interrupción Legal del Embarazo (ILE)</strong> es
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
          icon={<Heart className="h-5 w-5 text-purple-400" />}
          title="Acompañamiento integral"
          description="Tienes derecho a consejería pre y post intervención"
          color="purple"
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
      icon: <FileText className="h-5 w-5 text-purple-400" />
    },
    {
      title: 'Información clara y completa',
      description: 'Derecho a recibir toda la información sobre procedimientos, riesgos y cuidados',
      icon: <Info className="h-5 w-5 text-yellow-400" />
    },
    {
      title: 'Atención respetuosa',
      description: 'Sin discriminación, maltrato ni violencia obstétrica',
      icon: <Heart className="h-5 w-5 text-pink-400" />
    },
    {
      title: 'Objeción de conciencia limitada',
      description: 'Si un médico objeta, debe derivarte inmediatamente a otro profesional',
      icon: <Users className="h-5 w-5 text-orange-400" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Scale className="h-6 w-6 text-purple-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Ley 27.610 - Tus Derechos</h2>
            <p className="text-purple-100 text-sm leading-relaxed">
              Sancionada el 30 de diciembre de 2020, esta ley garantiza el acceso a la interrupción
              voluntaria del embarazo y a la atención postaborto en todo el país.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rights.map((right, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {right.icon}
              <div>
                <h3 className="font-semibold text-white mb-1">{right.title}</h3>
                <p className="text-white/70 text-sm">{right.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deberes de los médicos */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-400" />
          Deberes del Personal de Salud
        </h3>
        <ul className="space-y-3 text-sm text-blue-100">
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
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Métodos Disponibles</h2>
        <div className="space-y-4">
          {methods.map((method, index) => (
            <div key={index} className={`bg-${method.color}-600/10 border border-${method.color}-500/30 rounded-lg p-4`}>
              <h3 className="font-bold text-white mb-2">{method.name}</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p><strong className="text-white">Descripción:</strong> {method.description}</p>
                <p><strong className="text-white">Período:</strong> {method.weeks}</p>
                <p><strong className="text-white">Proceso:</strong> {method.process}</p>
                <p><strong className="text-white">Duración:</strong> {method.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Qué esperar */}
      <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-yellow-400" />
          Qué esperar (efectos normales)
        </h3>
        <ul className="space-y-2 text-sm text-yellow-100">
          {risks.map((risk, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cuándo buscar ayuda */}
      <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          Cuándo buscar atención médica urgente
        </h3>
        <ul className="space-y-2 text-sm text-red-100">
          {warnings.map((warning, index) => (
            <li key={index} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Contactar médico de emergencia
        </button>
      </div>

      {/* Cuidados post-procedimiento */}
      <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-400" />
          Cuidados posteriores
        </h3>
        <div className="space-y-3 text-sm text-green-100">
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
      <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Consulta con Especialistas</h2>
        <p className="text-purple-100 text-sm mb-4">
          Conecta con profesionales de salud capacitados en IVE/ILE que resolverán todas tus dudas
          de forma confidencial y sin prejuicios.
        </p>
        <button
          onClick={onRequestCall}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          <Video className="h-5 w-5" />
          Iniciar Videoconsulta Ahora
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Profesionales Disponibles</h3>
        {specialists.map((doctor, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{doctor.name}</h4>
                  <p className="text-sm text-white/70 mb-2">{doctor.specialty}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>⭐ {doctor.rating}</span>
                    <span>•</span>
                    <span>{doctor.consultations} consultas</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {doctor.available ? (
                  <>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Disponible
                    </span>
                    <button
                      onClick={onRequestCall}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
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
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Preguntas que puedes hacer:</h3>
        <ul className="space-y-2 text-sm text-blue-100">
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
      icon: <Heart className="h-5 w-5 text-pink-400" />
    },
    {
      name: 'Línea 144',
      contact: '144',
      description: 'Atención para víctimas de violencia de género (24hs)',
      icon: <Shield className="h-5 w-5 text-purple-400" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-pink-600/10 border border-pink-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">No estás sola</h2>
        <p className="text-pink-100 text-sm">
          Existen múltiples organizaciones y líneas de apoyo disponibles para acompañarte
          en este proceso con información, contención emocional y asesoramiento legal.
        </p>
      </div>

      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              {resource.icon}
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{resource.name}</h3>
                <p className="text-purple-300 font-mono text-sm mb-2">{resource.contact}</p>
                <p className="text-white/70 text-sm">{resource.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-white/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Acompañamiento emocional */}
      <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-400" />
          Apoyo Emocional
        </h3>
        <p className="text-purple-100 text-sm mb-4">
          Es normal experimentar diferentes emociones. Tienes derecho a recibir acompañamiento
          psicológico antes, durante y después del proceso.
        </p>
        <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Solicitar Apoyo Psicológico
        </button>
      </div>

      {/* Dónde realizarlo */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-400" />
          ¿Dónde puedo acceder?
        </h3>
        <ul className="space-y-2 text-sm text-blue-100">
          <li>• Hospitales públicos de todo el país</li>
          <li>• Centros de salud y CAPS</li>
          <li>• Obras sociales (obligatorio por ley)</li>
          <li>• Empresas de medicina prepaga (obligatorio por ley)</li>
        </ul>
        <p className="mt-4 text-xs text-blue-200/70">
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
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/70 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
