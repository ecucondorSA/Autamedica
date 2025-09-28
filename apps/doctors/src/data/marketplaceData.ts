import { MarketplaceJobOffer, MarketplaceDoctor, MarketplaceCompany, ARGENTINE_CITIES } from '@/types/marketplace'

export const mockJobOffers: MarketplaceJobOffer[] = [
  {
    id: 'job_001',
    title: 'Cardiólogo Senior',
    company: 'Hospital Italiano de Buenos Aires',
    companyLogo: '/logos/hospital-italiano.png',
    location: {
      city: 'Ciudad Autónoma de Buenos Aires',
      province: 'Ciudad Autónoma de Buenos Aires',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Ciudad Autónoma de Buenos Aires']
    },
    specialty: 'Cardiología',
    type: 'full-time',
    salary: {
      min: 800000,
      max: 1200000,
      currency: 'ARS',
      period: 'mes'
    },
    urgent: true,
    requirements: [
      'Especialización en Cardiología avalada por el Ministerio de Salud',
      '5+ años de experiencia en cardiología intervencionista',
      'Matrícula profesional vigente en CABA',
      'Experiencia en procedimientos hemodinámicos'
    ],
    benefits: [
      'Obra social premium (OSDE 450)',
      'Capacitación continua en el exterior',
      'Descuentos en farmacia',
      'Seguro de mala praxis incluido'
    ],
    description: 'Buscamos cardiólogo senior para incorporarse a nuestro equipo de hemodinamia. Excelente oportunidad de crecimiento profesional.',
    experience: 'Senior (5+ años)',
    schedule: 'Tiempo completo con guardias rotativas',
    remote: false,
    status: 'active',
    applicationsCount: 23,
    viewsCount: 156,
    publishedDate: '2024-12-20T10:00:00Z',
    deadline: '2024-12-30T23:59:59Z',
    contactInfo: {
      name: 'Dr. Roberto Martínez',
      email: 'rmartinez@hospitalitaliano.org.ar',
      phone: '+54 11 4959-0200'
    }
  },
  {
    id: 'job_002',
    title: 'Pediatra - Consulta Virtual',
    company: 'TeleMed Argentina',
    location: {
      city: 'Córdoba',
      province: 'Córdoba',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Córdoba']
    },
    specialty: 'Pediatría',
    type: 'part-time',
    salary: {
      min: 3500,
      max: 5500,
      currency: 'ARS',
      period: 'hora'
    },
    urgent: false,
    requirements: [
      'Especialización en Pediatría',
      'Experiencia en telemedicina',
      'Manejo de plataformas digitales',
      'Matrícula profesional vigente'
    ],
    benefits: [
      'Flexibilidad horaria total',
      'Capacitación en telemedicina',
      'Pago por consulta realizada',
      'Soporte técnico 24/7'
    ],
    description: 'Únete a la revolución de la telemedicina pediátrica. Trabaja desde casa atendiendo pacientes de toda Argentina.',
    experience: 'Intermedio (2-5 años)',
    schedule: 'Flexible, mínimo 20 horas semanales',
    remote: true,
    status: 'active',
    applicationsCount: 18,
    viewsCount: 89,
    publishedDate: '2024-12-19T14:30:00Z',
    contactInfo: {
      name: 'Lic. Ana Fernández',
      email: 'afernandez@telemedargentina.com',
      phone: '+54 351 555-0123'
    }
  },
  {
    id: 'job_003',
    title: 'Neurólogo - Urgencias',
    company: 'Hospital Provincial Rosario',
    location: {
      city: 'Rosario',
      province: 'Santa Fe',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Rosario']
    },
    specialty: 'Neurología',
    type: 'locum',
    salary: {
      min: 45000,
      max: 65000,
      currency: 'ARS',
      period: 'dia'
    },
    urgent: true,
    requirements: [
      'Especialización en Neurología',
      'Experiencia en guardia neurológica',
      'Disponibilidad inmediata',
      'Matrícula en Santa Fe'
    ],
    benefits: [
      'Pago diario por guardia',
      'Viáticos incluidos',
      'Seguro de mala praxis',
      'Reconocimiento de antecedentes'
    ],
    description: 'Necesitamos neurólogo urgente para cubrir guardias en hospital provincial. Posición temporal con posibilidad de permanencia.',
    experience: 'Junior a Senior',
    schedule: 'Guardias de 24 horas',
    remote: false,
    status: 'active',
    applicationsCount: 12,
    viewsCount: 67,
    publishedDate: '2024-12-21T08:00:00Z',
    deadline: '2024-12-25T18:00:00Z',
    contactInfo: {
      name: 'Dr. Carlos López',
      email: 'clopez@hospitalrosario.gob.ar',
      phone: '+54 341 555-0456'
    }
  },
  {
    id: 'job_004',
    title: 'Médico General - Clínica Privada',
    company: 'Clínica San Carlos',
    location: {
      city: 'Mendoza',
      province: 'Mendoza',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Mendoza']
    },
    specialty: 'Medicina General',
    type: 'part-time',
    salary: {
      min: 450000,
      max: 650000,
      currency: 'ARS',
      period: 'mes'
    },
    urgent: false,
    requirements: [
      'Título de Médico',
      'Residencia completa',
      'Experiencia en atención primaria',
      'Matrícula provincial vigente'
    ],
    benefits: [
      'Medio tiempo',
      'Obra social',
      'Vacaciones pagas',
      'Ambiente de trabajo excelente'
    ],
    description: 'Clínica privada de prestigio busca médico general para atención ambulatoria. Excelente calidad de vida profesional.',
    experience: 'Junior (1-3 años)',
    schedule: 'Medio tiempo, mañanas',
    remote: false,
    status: 'active',
    applicationsCount: 31,
    viewsCount: 145,
    publishedDate: '2024-12-18T12:00:00Z',
    contactInfo: {
      name: 'Dra. Patricia Morales',
      email: 'pmorales@clinicasancarlos.com.ar',
      phone: '+54 261 555-0789'
    }
  },
  {
    id: 'job_005',
    title: 'Traumatólogo - Medicina Deportiva',
    company: 'OSDE - Centro Médico',
    location: {
      city: 'La Plata',
      province: 'Buenos Aires',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['La Plata']
    },
    specialty: 'Traumatología',
    type: 'contract',
    salary: {
      min: 6500,
      max: 9500,
      currency: 'ARS',
      period: 'hora'
    },
    urgent: false,
    requirements: [
      'Especialización en Traumatología',
      'Subespecialización en Medicina Deportiva',
      'Experiencia con deportistas de alto rendimiento',
      'Manejo de artroscopía'
    ],
    benefits: [
      'Tarifa premium por hora',
      'Trabajo con equipos deportivos',
      'Acceso a tecnología de vanguardia',
      'Desarrollo profesional continuo'
    ],
    description: 'Centro médico de OSDE busca traumatólogo especializado en medicina deportiva para atención de deportistas de elite.',
    experience: 'Senior (5+ años)',
    schedule: 'Por consulta, flexible',
    remote: false,
    status: 'active',
    applicationsCount: 8,
    viewsCount: 42,
    publishedDate: '2024-12-17T16:00:00Z',
    contactInfo: {
      name: 'Dr. Fernando Silva',
      email: 'fsilva@osde.com.ar',
      phone: '+54 221 555-0321'
    }
  }
]

export const mockDoctors: MarketplaceDoctor[] = [
  {
    id: 'doc_001',
    name: 'Dra. María Elena González',
    avatar: '/avatars/maria-gonzalez.jpg',
    specialties: ['Cardiología', 'Medicina Interna'],
    location: {
      city: 'Ciudad Autónoma de Buenos Aires',
      province: 'Ciudad Autónoma de Buenos Aires',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Ciudad Autónoma de Buenos Aires']
    },
    rating: 4.9,
    experience: 12,
    hourlyRate: {
      amount: 8500,
      currency: 'ARS'
    },
    availableForHiring: true,
    responseTime: 2,
    isUrgentAvailable: true,
    isOnline: true,
    workArrangement: 'hybrid',
    languages: ['Español', 'Inglés'],
    verificationStatus: 'verified',
    licenseNumber: 'MN 45678 / MP 123456',
    offersDirectServices: true,
    totalJobs: 25,
    successRate: 98
  },
  {
    id: 'doc_002',
    name: 'Dr. Alejandro Martín Ruiz',
    specialties: ['Pediatría', 'Neonatología'],
    location: {
      city: 'Córdoba',
      province: 'Córdoba',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Córdoba']
    },
    rating: 4.8,
    experience: 8,
    hourlyRate: {
      amount: 7200,
      currency: 'ARS'
    },
    availableForHiring: true,
    responseTime: 1,
    isUrgentAvailable: false,
    isOnline: false,
    workArrangement: 'on_site',
    languages: ['Español'],
    verificationStatus: 'verified',
    licenseNumber: 'MP 789123',
    offersDirectServices: false,
    totalJobs: 18,
    successRate: 95
  },
  {
    id: 'doc_003',
    name: 'Dr. Fernando López',
    specialties: ['Neurología', 'Medicina de Emergencia'],
    location: {
      city: 'Rosario',
      province: 'Santa Fe',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Rosario']
    },
    rating: 4.7,
    experience: 15,
    hourlyRate: {
      amount: 9200,
      currency: 'ARS'
    },
    availableForHiring: true,
    responseTime: 3,
    isUrgentAvailable: true,
    isOnline: true,
    workArrangement: 'flexible',
    languages: ['Español', 'Portugués'],
    verificationStatus: 'verified',
    licenseNumber: 'MP 456789',
    offersDirectServices: true,
    totalJobs: 42,
    successRate: 96
  }
]

export const mockCompanies: MarketplaceCompany[] = [
  {
    id: 'comp_001',
    name: 'Hospital Italiano de Buenos Aires',
    logo: '/logos/hospital-italiano.png',
    industry: 'Salud y Medicina',
    location: {
      city: 'Ciudad Autónoma de Buenos Aires',
      province: 'Ciudad Autónoma de Buenos Aires',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Ciudad Autónoma de Buenos Aires']
    },
    rating: 4.8,
    activeJobs: 15,
    urgentJobs: 3,
    isActivelyHiring: true,
    totalHires: 127,
    companyType: 'hospital',
    employees: '1000-5000',
    foundedYear: 1853,
    website: 'https://www.hospitalitaliano.org.ar',
    description: 'Hospital universitario de alta complejidad, referente en medicina e investigación en Argentina y Latinoamérica.'
  },
  {
    id: 'comp_002',
    name: 'OSDE',
    logo: '/logos/osde.png',
    industry: 'Obra Social',
    location: {
      city: 'Ciudad Autónoma de Buenos Aires',
      province: 'Ciudad Autónoma de Buenos Aires',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Ciudad Autónoma de Buenos Aires']
    },
    rating: 4.6,
    activeJobs: 8,
    urgentJobs: 1,
    isActivelyHiring: true,
    totalHires: 89,
    companyType: 'prepaga',
    employees: '10000+',
    foundedYear: 1976,
    website: 'https://www.osde.com.ar',
    description: 'Líder en medicina prepaga en Argentina, con una amplia red de prestadores y centros médicos propios.'
  },
  {
    id: 'comp_003',
    name: 'Hospital Provincial Rosario',
    industry: 'Salud Pública',
    location: {
      city: 'Rosario',
      province: 'Santa Fe',
      country: 'Argentina',
      coordinates: ARGENTINE_CITIES['Rosario']
    },
    rating: 4.2,
    activeJobs: 12,
    urgentJobs: 5,
    isActivelyHiring: true,
    totalHires: 156,
    companyType: 'hospital',
    employees: '500-1000',
    foundedYear: 1945,
    description: 'Hospital público de referencia provincial, especializado en emergencias y medicina de alta complejidad.'
  }
]