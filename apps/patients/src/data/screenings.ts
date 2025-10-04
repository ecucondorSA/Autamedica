/**
 * Base de datos de Screenings Médicos - Argentina
 * Basado en guías del Ministerio de Salud de Argentina y recomendaciones internacionales
 */

export type ScreeningGender = 'male' | 'female' | 'all';
export type ScreeningCategory = 'cardiovascular' | 'cancer' | 'metabolic' | 'bone' | 'preventive' | 'other';

export interface Screening {
  id: string;
  name: string;
  shortName: string;
  description: string;
  gender: ScreeningGender;
  startAge: number;
  endAge: number | null; // null = sin límite
  frequency: string;
  frequencyMonths: number; // Para cálculos
  category: ScreeningCategory;
  icon: string; // lucide-react icon name
  benefits: string[];
  specialCases?: string[];
  coverage: 'total' | 'partial' | 'variable';
  urgency: 'high' | 'medium' | 'low';
}

export const SCREENINGS_DATABASE: Screening[] = [
  // CARDIOVASCULAR
  {
    id: 'blood-pressure',
    name: 'Control de Presión Arterial',
    shortName: 'Presión Arterial',
    description: 'Medición de la presión arterial para detectar hipertensión',
    gender: 'all',
    startAge: 18,
    endAge: null,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cardiovascular',
    icon: 'Heart',
    benefits: [
      'Detecta hipertensión antes de que cause daños',
      'Previene infartos y ACV',
      'Control simple y rápido'
    ],
    specialCases: ['Más frecuente si hay factores de riesgo'],
    coverage: 'total',
    urgency: 'high'
  },

  // METABÓLICO
  {
    id: 'glucose-female',
    name: 'Análisis de Glucemia en Ayunas',
    shortName: 'Glucemia',
    description: 'Medición de azúcar en sangre para detectar diabetes',
    gender: 'female',
    startAge: 45,
    endAge: null,
    frequency: 'Cada 3 años',
    frequencyMonths: 36,
    category: 'metabolic',
    icon: 'Activity',
    benefits: [
      'Detecta diabetes temprano',
      'Previene complicaciones graves',
      'Permite control con dieta y medicación'
    ],
    specialCases: ['Desde los 35 si hay sobrepeso u obesidad'],
    coverage: 'total',
    urgency: 'medium'
  },
  {
    id: 'glucose-male',
    name: 'Análisis de Glucemia en Ayunas',
    shortName: 'Glucemia',
    description: 'Medición de azúcar en sangre para detectar diabetes',
    gender: 'male',
    startAge: 35,
    endAge: null,
    frequency: 'Cada 3 años',
    frequencyMonths: 36,
    category: 'metabolic',
    icon: 'Activity',
    benefits: [
      'Detecta diabetes temprano',
      'Previene complicaciones graves',
      'Permite control con dieta y medicación'
    ],
    specialCases: ['Desde los 25 si hay sobrepeso u obesidad'],
    coverage: 'total',
    urgency: 'medium'
  },
  {
    id: 'cholesterol-female',
    name: 'Perfil Lipídico (Colesterol)',
    shortName: 'Colesterol',
    description: 'Análisis de colesterol y triglicéridos',
    gender: 'female',
    startAge: 45,
    endAge: null,
    frequency: 'Cada 5 años',
    frequencyMonths: 60,
    category: 'metabolic',
    icon: 'Droplet',
    benefits: [
      'Previene enfermedades cardiovasculares',
      'Detecta riesgo de infartos',
      'Permite tratamiento preventivo'
    ],
    specialCases: ['Desde los 35 si hay factores de riesgo'],
    coverage: 'total',
    urgency: 'medium'
  },
  {
    id: 'cholesterol-male',
    name: 'Perfil Lipídico (Colesterol)',
    shortName: 'Colesterol',
    description: 'Análisis de colesterol y triglicéridos',
    gender: 'male',
    startAge: 35,
    endAge: null,
    frequency: 'Cada 5 años',
    frequencyMonths: 60,
    category: 'metabolic',
    icon: 'Droplet',
    benefits: [
      'Previene enfermedades cardiovasculares',
      'Detecta riesgo de infartos',
      'Permite tratamiento preventivo'
    ],
    specialCases: ['Desde los 25 si hay factores de riesgo'],
    coverage: 'total',
    urgency: 'medium'
  },

  // CÁNCER - MUJERES
  {
    id: 'pap-test',
    name: 'Papanicolaou (PAP)',
    shortName: 'PAP',
    description: 'Estudio para detectar cáncer de cuello uterino',
    gender: 'female',
    startAge: 25,
    endAge: 64,
    frequency: 'Cada 3 años',
    frequencyMonths: 36,
    category: 'cancer',
    icon: 'FileText',
    benefits: [
      'Detecta cáncer de cuello uterino temprano',
      'Casi 100% de curación si se detecta a tiempo',
      'Procedimiento rápido y no doloroso'
    ],
    specialCases: ['Después de 2 PAP negativos consecutivos'],
    coverage: 'total',
    urgency: 'high'
  },
  {
    id: 'hpv-test',
    name: 'Test de VPH',
    shortName: 'VPH',
    description: 'Detección del Virus del Papiloma Humano',
    gender: 'female',
    startAge: 30,
    endAge: 64,
    frequency: 'Cada 5 años',
    frequencyMonths: 60,
    category: 'cancer',
    icon: 'Shield',
    benefits: [
      'Detecta VPH antes de que cause cáncer',
      'Puede reemplazar al PAP',
      'Mayor precisión diagnóstica'
    ],
    specialCases: ['Puede reemplazar al PAP según criterio médico'],
    coverage: 'total',
    urgency: 'high'
  },
  {
    id: 'mammography',
    name: 'Mamografía',
    shortName: 'Mamografía',
    description: 'Radiografía de mamas para detectar cáncer de mama',
    gender: 'female',
    startAge: 50,
    endAge: 69,
    frequency: 'Cada 2 años',
    frequencyMonths: 24,
    category: 'cancer',
    icon: 'Scan',
    benefits: [
      'Detecta cáncer de mama en etapas tempranas',
      'Reduce mortalidad hasta 30%',
      'Cobertura 100% por Programa Nacional'
    ],
    specialCases: ['Programa Nacional: bilateral, dos proyecciones'],
    coverage: 'total',
    urgency: 'high'
  },
  {
    id: 'breast-ultrasound',
    name: 'Ecografía Mamaria',
    shortName: 'Eco Mamaria',
    description: 'Complemento de la mamografía en mamas densas',
    gender: 'female',
    startAge: 40,
    endAge: null,
    frequency: 'Según criterio médico',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'Radio',
    benefits: [
      'Complementa la mamografía',
      'Útil en mamas densas',
      'No usa radiación'
    ],
    specialCases: ['Complemento en mamas densas o antecedentes'],
    coverage: 'partial',
    urgency: 'medium'
  },

  // CÁNCER - TODOS
  {
    id: 'colonoscopy',
    name: 'Colonoscopia',
    shortName: 'Colonoscopia',
    description: 'Estudio del colon para detectar cáncer colorrectal',
    gender: 'all',
    startAge: 50,
    endAge: 75,
    frequency: 'Cada 10 años',
    frequencyMonths: 120,
    category: 'cancer',
    icon: 'Search',
    benefits: [
      'Detecta y previene cáncer de colon',
      'Permite extirpar pólipos durante el estudio',
      'Alta efectividad diagnóstica'
    ],
    specialCases: ['Antes si hay antecedentes familiares (desde 40)'],
    coverage: 'total',
    urgency: 'high'
  },
  {
    id: 'fobt',
    name: 'Test de Sangre Oculta en Materia Fecal',
    shortName: 'Sangre Oculta',
    description: 'Análisis de heces para detectar sangrado intestinal',
    gender: 'all',
    startAge: 50,
    endAge: 75,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'TestTube',
    benefits: [
      'Alternativa no invasiva a colonoscopia',
      'Detecta sangrado intestinal temprano',
      'Bajo costo y fácil realización'
    ],
    specialCases: ['Alternativa si no se puede hacer colonoscopia'],
    coverage: 'total',
    urgency: 'medium'
  },

  // CÁNCER - HOMBRES
  {
    id: 'psa',
    name: 'PSA (Antígeno Prostático)',
    shortName: 'PSA',
    description: 'Análisis de sangre para detectar cáncer de próstata',
    gender: 'male',
    startAge: 50,
    endAge: 75,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'Droplets',
    benefits: [
      'Detecta cáncer de próstata temprano',
      'Alta tasa de curación si se detecta a tiempo',
      'Análisis de sangre simple'
    ],
    specialCases: ['Desde los 45 si hay antecedentes familiares'],
    coverage: 'total',
    urgency: 'high'
  },
  {
    id: 'rectal-exam',
    name: 'Tacto Rectal',
    shortName: 'Tacto Rectal',
    description: 'Examen físico de la próstata',
    gender: 'male',
    startAge: 50,
    endAge: 75,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'Hand',
    benefits: [
      'Complementa el PSA',
      'Detecta anomalías prostáticas',
      'Evaluación directa de la glándula'
    ],
    specialCases: ['En conjunto con PSA para screening prostático'],
    coverage: 'total',
    urgency: 'high'
  },

  // ÓSEO
  {
    id: 'bone-density-female',
    name: 'Densitometría Ósea',
    shortName: 'Densitometría',
    description: 'Medición de densidad ósea para detectar osteoporosis',
    gender: 'female',
    startAge: 65,
    endAge: null,
    frequency: 'Cada 2 años',
    frequencyMonths: 24,
    category: 'bone',
    icon: 'Bone',
    benefits: [
      'Detecta osteoporosis temprano',
      'Previene fracturas',
      'Permite tratamiento preventivo'
    ],
    specialCases: ['Desde los 50 si hay menopausia precoz o factores de riesgo'],
    coverage: 'total',
    urgency: 'medium'
  },
  {
    id: 'bone-density-male',
    name: 'Densitometría Ósea',
    shortName: 'Densitometría',
    description: 'Medición de densidad ósea para detectar osteoporosis',
    gender: 'male',
    startAge: 70,
    endAge: null,
    frequency: 'Cada 2 años',
    frequencyMonths: 24,
    category: 'bone',
    icon: 'Bone',
    benefits: [
      'Detecta osteoporosis temprano',
      'Previene fracturas',
      'Permite tratamiento preventivo'
    ],
    specialCases: ['Antes si hay fracturas previas o uso de corticoides'],
    coverage: 'total',
    urgency: 'low'
  },

  // FUMADORES
  {
    id: 'lung-ct',
    name: 'TAC de Tórax de Baja Dosis',
    shortName: 'TAC Tórax',
    description: 'Tomografía para detectar cáncer de pulmón en fumadores',
    gender: 'all',
    startAge: 55,
    endAge: 74,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'Lungs',
    benefits: [
      'Detecta cáncer de pulmón temprano',
      'Reduce mortalidad en fumadores',
      'Baja dosis de radiación'
    ],
    specialCases: ['Solo si fuma ≥30 paquetes/año o dejó hace <15 años'],
    coverage: 'variable',
    urgency: 'high'
  },

  // VISUAL
  {
    id: 'eye-exam',
    name: 'Examen Visual y Glaucoma',
    shortName: 'Control Visual',
    description: 'Control oftalmológico completo',
    gender: 'all',
    startAge: 40,
    endAge: null,
    frequency: 'Cada 2-4 años',
    frequencyMonths: 36,
    category: 'preventive',
    icon: 'Eye',
    benefits: [
      'Detecta glaucoma temprano',
      'Previene ceguera',
      'Corrige problemas de visión'
    ],
    specialCases: ['Anual si hay antecedentes familiares o diabetes'],
    coverage: 'partial',
    urgency: 'medium'
  },

  // ODONTOLÓGICO
  {
    id: 'dental-checkup',
    name: 'Control Odontológico',
    shortName: 'Odontología',
    description: 'Revisión dental y limpieza',
    gender: 'all',
    startAge: 6,
    endAge: null,
    frequency: 'Cada 6 meses',
    frequencyMonths: 6,
    category: 'preventive',
    icon: 'Smile',
    benefits: [
      'Previene caries y enfermedades bucales',
      'Detecta problemas tempranos',
      'Mantiene salud general'
    ],
    coverage: 'partial',
    urgency: 'medium'
  },

  // DERMATOLÓGICO
  {
    id: 'skin-exam',
    name: 'Control Dermatológico (Lunares)',
    shortName: 'Control de Piel',
    description: 'Revisión de lunares y manchas en la piel',
    gender: 'all',
    startAge: 18,
    endAge: null,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'cancer',
    icon: 'Sun',
    benefits: [
      'Detecta melanoma temprano',
      'Previene cáncer de piel',
      'Control simple y rápido'
    ],
    specialCases: ['Más frecuente en personas de piel clara o con muchos lunares'],
    coverage: 'partial',
    urgency: 'medium'
  },

  // VACUNAS
  {
    id: 'flu-vaccine',
    name: 'Vacuna Antigripal',
    shortName: 'Antigripal',
    description: 'Vacuna anual contra la gripe',
    gender: 'all',
    startAge: 65,
    endAge: null,
    frequency: 'Anual',
    frequencyMonths: 12,
    category: 'preventive',
    icon: 'Syringe',
    benefits: [
      'Previene complicaciones graves de gripe',
      'Reduce hospitalizaciones',
      'Protección para grupos de riesgo'
    ],
    specialCases: ['También en embarazadas y grupos de riesgo'],
    coverage: 'total',
    urgency: 'medium'
  },
  {
    id: 'pneumococcal-vaccine',
    name: 'Vacuna Antineumocócica',
    shortName: 'Antineumocócica',
    description: 'Vacuna contra neumonía bacteriana',
    gender: 'all',
    startAge: 65,
    endAge: null,
    frequency: 'Una vez',
    frequencyMonths: 0,
    category: 'preventive',
    icon: 'Shield',
    benefits: [
      'Previene neumonía grave',
      'Protección duradera',
      'Especialmente importante en mayores'
    ],
    specialCases: ['Esquema secuencial según indicación médica'],
    coverage: 'total',
    urgency: 'medium'
  }
];

/**
 * Obtiene screenings recomendados según edad y género
 */
export function getRecommendedScreenings(age: number, gender: 'male' | 'female'): Screening[] {
  return SCREENINGS_DATABASE.filter(screening => {
    // Filtro por género
    if (screening.gender !== 'all' && screening.gender !== gender) {
      return false;
    }

    // Filtro por edad
    if (age < screening.startAge) {
      return false;
    }

    if (screening.endAge !== null && age > screening.endAge) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Ordenar por urgencia y luego por categoría
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

/**
 * Agrupa screenings por categoría
 */
export function groupScreeningsByCategory(screenings: Screening[]): Record<ScreeningCategory, Screening[]> {
  const grouped: Record<ScreeningCategory, Screening[]> = {
    cardiovascular: [],
    cancer: [],
    metabolic: [],
    bone: [],
    preventive: [],
    other: []
  };

  screenings.forEach(screening => {
    grouped[screening.category].push(screening);
  });

  return grouped;
}

/**
 * Obtiene todos los hitos (milestones) de edad donde cambian los screenings
 */
export function getAgeMilestones(): number[] {
  const ages = new Set<number>();

  SCREENINGS_DATABASE.forEach(screening => {
    ages.add(screening.startAge);
    if (screening.endAge !== null) {
      ages.add(screening.endAge);
    }
  });

  return Array.from(ages).sort((a, b) => a - b);
}

/**
 * Nombres legibles de categorías
 */
export const CATEGORY_LABELS: Record<ScreeningCategory, string> = {
  cardiovascular: 'Cardiovascular',
  cancer: 'Detección de Cáncer',
  metabolic: 'Metabólico',
  bone: 'Salud Ósea',
  preventive: 'Preventivo General',
  other: 'Otros'
};

/**
 * Colores por categoría
 */
export const CATEGORY_COLORS: Record<ScreeningCategory, { bg: string; text: string; border: string }> = {
  cardiovascular: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  cancer: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  metabolic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  bone: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  preventive: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  other: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-300' }
};
