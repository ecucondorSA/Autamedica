export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  city: string
  province: string
  country: string
  coordinates: Coordinates
}

export interface MarketplaceJobOffer {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: Location
  specialty: string
  type: 'full-time' | 'part-time' | 'contract' | 'locum' | 'remote'
  salary: {
    min: number
    max: number
    currency: 'ARS' | 'USD'
    period: 'hora' | 'dia' | 'mes' | 'año'
  }
  urgent: boolean
  requirements: string[]
  benefits: string[]
  description: string
  experience: string
  schedule: string
  remote: boolean
  status: 'active' | 'paused' | 'closed'
  applicationsCount: number
  viewsCount: number
  publishedDate: string
  deadline?: string
  contactInfo: {
    name: string
    email: string
    phone?: string
  }
}

export interface MarketplaceDoctor {
  id: string
  name: string
  avatar?: string
  specialties: string[]
  location: Location
  rating: number
  experience: number
  hourlyRate: {
    amount: number
    currency: 'ARS' | 'USD'
  }
  availableForHiring: boolean
  responseTime: number
  isUrgentAvailable: boolean
  isOnline: boolean
  workArrangement: 'remote' | 'hybrid' | 'on_site' | 'flexible'
  languages: string[]
  verificationStatus: 'verified' | 'pending' | 'unverified'
  licenseNumber: string
  offersDirectServices: boolean
  totalJobs: number
  successRate: number
}

export interface MarketplaceCompany {
  id: string
  name: string
  logo?: string
  industry: string
  location: Location
  rating: number
  activeJobs: number
  urgentJobs: number
  isActivelyHiring: boolean
  totalHires: number
  companyType: 'hospital' | 'clinica' | 'laboratorio' | 'farmacia' | 'mutual' | 'prepaga' | 'otro'
  employees: string
  foundedYear: number
  website?: string
  description: string
}

export interface MarketplaceFilters {
  specialty?: string
  location?: string
  type?: string[]
  salary?: {
    min: number
    max: number
    currency: 'ARS' | 'USD'
  }
  experience?: string
  urgent?: boolean
  remote?: boolean
  workArrangement?: string[]
}

export interface JobApplication {
  id: string
  jobId: string
  doctorId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  appliedDate: string
  coverLetter?: string
  expectedSalary?: {
    amount: number
    currency: 'ARS' | 'USD'
  }
  availability: string
  notes?: string
}

export const ARGENTINE_PROVINCES = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
] as const

export const ARGENTINE_CITIES = {
  'Ciudad Autónoma de Buenos Aires': { lat: -34.6037, lng: -58.3816 },
  'La Plata': { lat: -34.9215, lng: -57.9545 },
  'Mar del Plata': { lat: -38.0055, lng: -57.5426 },
  'Córdoba': { lat: -31.4135, lng: -64.1811 },
  'Rosario': { lat: -32.9442, lng: -60.6505 },
  'Mendoza': { lat: -32.8908, lng: -68.8272 },
  'San Miguel de Tucumán': { lat: -26.8083, lng: -65.2176 },
  'Salta': { lat: -24.7859, lng: -65.4117 },
  'Santa Fe': { lat: -31.6333, lng: -60.7 },
  'San Juan': { lat: -31.5375, lng: -68.5364 },
  'Resistencia': { lat: -27.4611, lng: -58.9844 },
  'Neuquén': { lat: -38.9516, lng: -68.0591 },
  'Posadas': { lat: -27.3621, lng: -55.8981 },
  'Bariloche': { lat: -41.1335, lng: -71.3103 },
  'Comodoro Rivadavia': { lat: -45.8667, lng: -67.5 }
} as const