/**
 * Configuración de pasos de Anamnesis Interactiva
 * Con storytelling médico educativo
 */

import type { AnamnesisStep } from '../types/anamnesis';

export const anamnesisSteps: AnamnesisStep[] = [
  // ==========================================
  // PASO 1: EDAD - El contexto que cambia todo
  // ==========================================
  {
    id: 'edad',
    title: '📅 Tu Edad: El Primer Detective',
    subtitle: 'La edad es la primera pista que guía al médico',
    category: 'filiacion',
    completed: false,
    story: {
      intro: 'Imagina que un paciente llega diciendo "me duele el pecho". La primera pregunta del médico es: ¿cuántos años tiene?',
      why: 'La edad cambia completamente lo que el médico piensa. Un dolor de pecho en un niño de 8 años probablemente sea una contractura muscular por jugar. El mismo dolor en un adulto de 65 años con presión alta puede ser un infarto. ¡La edad es el primer detective!',
      example: '👦 Carlos, 10 años, dolor de pecho después de jugar fútbol → Médico piensa: contractura muscular.\n\n👨 Roberto, 60 años, dolor de pecho irradiado al brazo → Médico piensa: ¿infarto? ¡Urgente!',
      didYouKnow: '💡 ¿Sabías que hay enfermedades que solo aparecen en ciertas edades? Por ejemplo, la apendicitis es rara antes de los 2 años, y la diabetes tipo 2 era rara en niños hasta hace 20 años (ahora no tanto por obesidad infantil).',
    },
    fields: [
      {
        id: 'edad',
        type: 'number',
        label: '¿Cuántos años tienes?',
        placeholder: 'Ejemplo: 45',
        required: true,
        validation: { min: 0, max: 120 },
        educationalNote: 'Tu edad ayuda al médico a pensar en las causas más probables de tus síntomas. Cada etapa de la vida tiene sus propias condiciones típicas.',
      },
      {
        id: 'fecha_nacimiento',
        type: 'date',
        label: 'Fecha de nacimiento',
        required: true,
        tooltip: 'Importante para calcular dosis de medicamentos y vacunas pendientes',
      },
    ],
  },

  // ==========================================
  // PASO 2: OCUPACIÓN - Riesgos Ocultos
  // ==========================================
  {
    id: 'ocupacion',
    title: '💼 Tu Trabajo: Pistas Escondidas',
    subtitle: 'Cada profesión tiene sus propios riesgos de salud',
    category: 'filiacion',
    completed: false,
    mediaUrl: '/videos/anamnesis/Tu_Trabajo_Tu_Salud_1.4x_h264.mp4',
    fields: [
      {
        id: 'ocupacion_actual',
        type: 'text',
        label: '¿A qué te dedicas actualmente?',
        placeholder: 'Ejemplo: Maestra de primaria',
        required: true,
        educationalNote: 'Conocer tu ocupación ayuda a identificar factores de riesgo específicos de tu trabajo.',
      },
      {
        id: 'años_ocupacion',
        type: 'number',
        label: '¿Cuántos años llevas en este trabajo?',
        placeholder: 'Ejemplo: 10',
        required: false,
        tooltip: 'El tiempo de exposición a factores laborales es importante',
      },
      {
        id: 'exposicion_riesgos',
        type: 'multiselect',
        label: '¿Estás expuesto a alguno de estos en tu trabajo?',
        required: false,
        options: [
          { value: 'quimicos', label: 'Químicos o vapores', explanation: 'Pinturas, solventes, gases' },
          { value: 'ruido', label: 'Ruido intenso', explanation: 'Fábricas, construcción, música alta' },
          { value: 'polvo', label: 'Polvo o partículas', explanation: 'Construcción, minería, carpintería' },
          { value: 'pantallas', label: 'Pantallas por muchas horas', explanation: 'Oficinas, programación' },
          { value: 'cargas', label: 'Cargar peso frecuentemente', explanation: 'Mudanzas, enfermería, construcción' },
          { value: 'estres', label: 'Estrés laboral alto', explanation: 'Atención al cliente, emergencias' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 3: MOTIVO DE CONSULTA - Tu Historia Hoy
  // ==========================================
  {
    id: 'motivo_consulta',
    title: '🎯 ¿Por Qué Consultas Hoy?',
    subtitle: 'Cuéntanos qué te trae por aquí',
    category: 'motivo_consulta',
    completed: false,
    mediaUrl: '/videos/anamnesis/Comunicar_tus_Síntomas_1.4x_h264.mp4',
    fields: [
      {
        id: 'sintoma_principal',
        type: 'textarea',
        label: 'Describe con tus palabras qué te está molestando',
        placeholder: 'Ejemplo: Me duele la cabeza del lado derecho, como si me palpitara, y me da cuando estoy estresada...',
        required: true,
        educationalNote: 'Mientras más detalles, mejor. No tengas miedo de usar tus propias palabras.',
      },
      {
        id: 'cuando_empezo',
        type: 'select',
        label: '¿Cuándo comenzó este síntoma?',
        required: true,
        options: [
          { value: 'hoy', label: 'Hoy', explanation: 'Síntoma agudo, inicio reciente' },
          { value: '2-7dias', label: 'Hace 2-7 días', explanation: 'Síntoma subagudo' },
          { value: '1-4semanas', label: 'Hace 1-4 semanas', explanation: 'Síntoma reciente pero persistente' },
          { value: '1-6meses', label: 'Hace 1-6 meses', explanation: 'Síntoma crónico' },
          { value: 'mas6meses', label: 'Más de 6 meses', explanation: 'Síntoma crónico establecido' },
        ],
      },
      {
        id: 'intensidad_sintoma',
        type: 'scale',
        label: 'Intensidad del síntoma (1 = leve, 10 = insoportable)',
        required: true,
        validation: { min: 1, max: 10 },
        tooltip: '1-3: Leve (no interrumpe actividades)\n4-6: Moderado (molesta pero puedes funcionar)\n7-9: Severo (dificulta mucho tu día)\n10: Peor dolor imaginable',
      },
    ],
  },

  // ==========================================
  // PASO 4: ANTECEDENTES - Tu Historia Médica
  // ==========================================
  {
    id: 'enfermedades_previas',
    title: '📋 Tus Enfermedades Previas',
    subtitle: 'El pasado médico explica el presente',
    category: 'antecedentes_personales',
    completed: false,
    mediaUrl: '/videos/anamnesis/El_mapa_genético_de_tu_salud_1.4x_h264.mp4',
    fields: [
      {
        id: 'enfermedades_cronicas',
        type: 'multiselect',
        label: '¿Tienes o has tenido alguna de estas enfermedades?',
        required: true,
        options: [
          { value: 'diabetes', label: 'Diabetes', explanation: 'Afecta cicatrización, riesgo de infecciones' },
          { value: 'hipertension', label: 'Presión alta (Hipertensión)', explanation: 'Riesgo cardiovascular' },
          { value: 'asma', label: 'Asma', explanation: 'Importante para anestesia y medicamentos' },
          { value: 'epilepsia', label: 'Epilepsia', explanation: 'Importante para manejo de crisis' },
          { value: 'cancer', label: 'Cáncer', explanation: 'Seguimiento y riesgo de recurrencia' },
          { value: 'hepatitis', label: 'Hepatitis B o C', explanation: 'Riesgo de cirrosis' },
          { value: 'vih', label: 'VIH', explanation: 'Inmunosupresión, infecciones oportunistas' },
          { value: 'tiroides', label: 'Problemas de tiroides', explanation: 'Afecta metabolismo' },
          { value: 'ninguna', label: 'Ninguna de las anteriores', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 5: MEDICAMENTOS - Tu Arsenal Actual
  // ==========================================
  {
    id: 'medicamentos',
    title: '💊 Tus Medicamentos Actuales',
    subtitle: 'Saber qué tomas puede salvar tu vida',
    category: 'antecedentes_personales',
    completed: false,
    story: {
      intro: 'Una señora llega al hospital con sangrado. Toma warfarina (anticoagulante) pero olvidó decirlo. El médico le da aspirina (también anticoagulante). Resultado: hemorragia grave. ¡Conocer tus medicamentos es VITAL!',
      why: 'Los medicamentos interactúan entre sí. Algunos se potencian (efecto multiplicado), otros se anulan, y otros se vuelven tóxicos juntos.',
      example: '⚠️ INTERACCIONES PELIGROSAS:\n- Warfarina + Aspirina = Sangrado grave\n- Antidepresivos + Tramadol = Síndrome serotoninérgico (mortal)\n- Antibióticos + Anticonceptivos = Embarazo no deseado (el antibiótico anula la píldora)\n- Omeprazol + Anticoagulantes = Menos efecto anticoagulante',
      didYouKnow: '💡 DATO IMPORTANTE:\n- El jugo de pomelo (toronja) interactúa con más de 85 medicamentos\n- La hierba de San Juan anula anticonceptivos y antidepresivos\n- Muchos medicamentos "naturales" interactúan con fármacos\n- SIEMPRE debes decir TODO lo que tomas, incluido vitaminas y hierbas',
    },
    fields: [
      {
        id: 'toma_medicamentos',
        type: 'boolean',
        label: '¿Tomas algún medicamento actualmente?',
        required: true,
      },
      {
        id: 'lista_medicamentos',
        type: 'textarea',
        label: 'Lista todos tus medicamentos (nombre, dosis, para qué)',
        placeholder: 'Ejemplo:\n- Enalapril 10mg, 1 por día, para presión\n- Metformina 850mg, 2 por día, para diabetes\n- Omeprazol 20mg, 1 por día, para gastritis',
        required: false,
        dependsOn: { fieldId: 'toma_medicamentos', value: true },
        educationalNote: 'Incluye: medicamentos de farmacia, vitaminas, suplementos, hierbas naturales, cremas. TODO cuenta.',
      },
    ],
  },

  // ==========================================
  // PASO 6: ALERGIAS - Tu Sistema de Alarma
  // ==========================================
  {
    id: 'alergias',
    title: '⚠️ Alergias: Tu Sistema de Alarma',
    subtitle: 'Una alergia mal reportada puede ser mortal',
    category: 'antecedentes_personales',
    completed: false,
    story: {
      intro: 'Un paciente dice "soy alérgico a la penicilina". El médico pregunta: ¿qué te pasó? "Me dio diarrea". Eso NO es alergia, es efecto secundario. La diferencia puede salvar una vida porque la penicilina podría ser el mejor antibiótico para su infección actual.',
      why: 'Hay ENORME diferencia entre alergia real (reacción del sistema inmune) y efecto secundario (molestia tolerab le). Una alergia verdadera significa que el medicamento puede matarte. Un efecto secundario significa que te molesta pero no es peligroso.',
      example: '⚠️ ALERGIA REAL vs EFECTO SECUNDARIO:\n\n✅ ALERGIA (PELIGROSO):\n- Ronchas por todo el cuerpo\n- Hinchazón de labios/lengua/garganta\n- Dificultad para respirar\n- Desmayo o presión muy baja\n\n⚡ EFECTO SECUNDARIO (MOLESTO pero NO peligroso):\n- Náusea o diarrea\n- Dolor de cabeza\n- Somnolencia\n- Mareo leve',
      didYouKnow: '💡 DATOS IMPORTANTES:\n- Solo 10% de personas que dicen "soy alérgico a penicilina" tienen alergia real\n- Reportar alergia falsa puede forzar al médico a usar antibióticos menos efectivos\n- Las alergias VERDADERAS pueden empeorar con cada exposición (anafilaxia)\n- Alergia a mariscos/yodo NO significa alergia a medio de contraste radiológico',
    },
    fields: [
      {
        id: 'tiene_alergias',
        type: 'boolean',
        label: '¿Tienes alergias a medicamentos, alimentos o sustancias?',
        required: true,
      },
      {
        id: 'lista_alergias',
        type: 'textarea',
        label: 'Lista tus alergias y describe QUÉ TE PASÓ exactamente',
        placeholder: 'Ejemplo:\n- Penicilina: ronchas en todo el cuerpo y hinchazón de labios (alergia real)\n- Ibuprofeno: me da dolor de estómago (efecto secundario)\n- Mariscos: vómitos y ronchas (alergia real)',
        required: false,
        dependsOn: { fieldId: 'tiene_alergias', value: true },
        educationalNote: 'Describe los síntomas EXACTOS. Esto ayuda al médico a distinguir alergia real de efecto secundario.',
      },
    ],
  },

  // ==========================================
  // PASO 7: ANTECEDENTES FAMILIARES - Tu Código Genético
  // ==========================================
  {
    id: 'antecedentes_familiares',
    title: '👨‍👩‍👧‍👦 Tu Historia Familiar: El Código Genético',
    subtitle: 'Las enfermedades de tu familia son pistas de tu futuro',
    category: 'antecedentes_familiares',
    completed: false,
    fields: [
      {
        id: 'padre_vivo',
        type: 'boolean',
        label: '¿Tu padre está vivo?',
        required: true,
      },
      {
        id: 'padre_edad',
        type: 'number',
        label: 'Edad actual de tu padre',
        placeholder: 'Ejemplo: 65',
        required: false,
        dependsOn: { fieldId: 'padre_vivo', value: true },
        validation: { min: 0, max: 120 },
      },
      {
        id: 'padre_enfermedades',
        type: 'multiselect',
        label: 'Enfermedades de tu padre (vivo o fallecido)',
        required: false,
        options: [
          { value: 'diabetes', label: 'Diabetes', explanation: 'Aumenta tu riesgo 40%' },
          { value: 'hipertension', label: 'Presión alta', explanation: 'Riesgo hereditario 2x' },
          { value: 'infarto', label: 'Infarto cardíaco', explanation: 'Especialmente si fue antes de 55 años' },
          { value: 'cancer', label: 'Cáncer (especificar tipo abajo)', explanation: 'Algunos cánceres son hereditarios' },
          { value: 'colesterol_alto', label: 'Colesterol alto familiar', explanation: 'Forma genética = riesgo de infarto joven' },
          { value: 'ninguna', label: 'Ninguna enfermedad conocida', explanation: '' },
        ],
      },
      {
        id: 'padre_causa_muerte',
        type: 'text',
        label: '¿De qué falleció tu padre? (si aplica)',
        placeholder: 'Ejemplo: Infarto cardíaco a los 52 años',
        required: false,
        dependsOn: { fieldId: 'padre_vivo', value: false },
      },
      {
        id: 'madre_viva',
        type: 'boolean',
        label: '¿Tu madre está viva?',
        required: true,
      },
      {
        id: 'madre_edad',
        type: 'number',
        label: 'Edad actual de tu madre',
        placeholder: 'Ejemplo: 62',
        required: false,
        dependsOn: { fieldId: 'madre_viva', value: true },
        validation: { min: 0, max: 120 },
      },
      {
        id: 'madre_enfermedades',
        type: 'multiselect',
        label: 'Enfermedades de tu madre (viva o fallecida)',
        required: false,
        options: [
          { value: 'diabetes', label: 'Diabetes', explanation: 'Aumenta tu riesgo 40%' },
          { value: 'hipertension', label: 'Presión alta', explanation: 'Riesgo hereditario 2x' },
          { value: 'cancer_mama', label: 'Cáncer de mama', explanation: 'Riesgo hereditario importante, considerar BRCA' },
          { value: 'cancer_ovario', label: 'Cáncer de ovario', explanation: 'Puede indicar síndrome BRCA' },
          { value: 'osteoporosis', label: 'Osteoporosis', explanation: 'Riesgo hereditario en mujeres' },
          { value: 'tiroides', label: 'Problemas de tiroides', explanation: 'Componente hereditario frecuente' },
          { value: 'ninguna', label: 'Ninguna enfermedad conocida', explanation: '' },
        ],
      },
      {
        id: 'madre_causa_muerte',
        type: 'text',
        label: '¿De qué falleció tu madre? (si aplica)',
        placeholder: 'Ejemplo: Cáncer de mama a los 58 años',
        required: false,
        dependsOn: { fieldId: 'madre_viva', value: false },
      },
      {
        id: 'hermanos_enfermedades',
        type: 'multiselect',
        label: '¿Tus hermanos tienen alguna de estas condiciones?',
        required: false,
        options: [
          { value: 'diabetes', label: 'Diabetes tipo 1 o 2', explanation: 'Riesgo compartido familiar' },
          { value: 'cancer_joven', label: 'Cáncer antes de 50 años', explanation: 'Señal de síndrome hereditario' },
          { value: 'enfermedad_mental', label: 'Depresión o trastorno bipolar', explanation: 'Componente hereditario significativo' },
          { value: 'autoinmune', label: 'Enfermedad autoinmune', explanation: 'Lupus, artritis reumatoide, etc.' },
          { value: 'no_hermanos', label: 'No tengo hermanos', explanation: '' },
          { value: 'ninguna', label: 'Ninguna enfermedad conocida', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 8: HÁBITOS - Tu Estilo de Vida
  // ==========================================
  {
    id: 'habitos',
    title: '🏃‍♂️ Tus Hábitos: Lo Que Haces Cada Día',
    subtitle: 'Tu estilo de vida determina el 70% de tu salud futura',
    category: 'antecedentes_personales',
    completed: false,
    story: {
      intro: 'Dos gemelos idénticos, mismo ADN. Uno fuma 20 cigarrillos al día, sedentario, come comida rápida. El otro no fuma, corre 3 veces por semana, dieta mediterránea. A los 60 años: el primero tiene enfisema, diabetes y tuvo un infarto. El segundo está sano. La genética carga el arma, pero el estilo de vida aprieta el gatillo.',
      why: 'Los hábitos son el factor MÁS IMPORTANTE para prevenir enfermedades. Fumar causa 30% de todos los cánceres. El sedentarismo aumenta riesgo de infarto 2x. La dieta puede prevenir o causar diabetes tipo 2.',
      example: '📊 IMPACTO DE HÁBITOS EN TU SALUD:\n\n🚬 TABAQUISMO:\n- 1 paquete/día por 20 años = riesgo de cáncer pulmón 20x\n- Fumar + anticonceptivos = riesgo de trombosis 35x\n- Dejar de fumar antes de 40 años = casi elimina el exceso de riesgo\n\n🍺 ALCOHOL:\n- 2+ bebidas/día = riesgo de cirrosis 6x\n- Alcohol + hepatitis C = cirrosis en 10 años (vs 30 años sin alcohol)\n- "Binge drinking" (5+ bebidas) 1 vez/semana = daño cardíaco\n\n🏃 EJERCICIO:\n- 150 min/semana = reduce mortalidad 30%\n- Sedentarismo = equivalente a fumar para riesgo cardiovascular\n- Ejercicio reduce riesgo de Alzheimer 45%',
      didYouKnow: '💡 DATOS QUE TE SORPRENDERÁN:\n- Dormir <6 horas aumenta riesgo de diabetes 28%\n- Sentarse >8 horas/día = riesgo de muerte prematura +15% (incluso si haces ejercicio)\n- Comer ultra-procesados 4+ veces/semana = riesgo de muerte 62% mayor\n- Red social fuerte reduce mortalidad 50% (equivalente a dejar de fumar)\n- Tener propósito de vida reduce riesgo de Alzheimer 50%',
    },
    fields: [
      {
        id: 'fuma',
        type: 'select',
        label: '¿Fumas o has fumado?',
        required: true,
        options: [
          { value: 'nunca', label: 'Nunca he fumado', explanation: '¡Excelente! Mantente así' },
          { value: 'exfumador', label: 'Fumé antes, ya dejé', explanation: 'El riesgo disminuye con los años' },
          { value: 'actual', label: 'Sí, fumo actualmente', explanation: 'Importante para calcular riesgo' },
        ],
      },
      {
        id: 'cigarrillos_dia',
        type: 'number',
        label: '¿Cuántos cigarrillos fumas por día?',
        placeholder: 'Ejemplo: 10',
        required: false,
        dependsOn: { fieldId: 'fuma', value: 'actual' },
        validation: { min: 0, max: 100 },
        educationalNote: 'Cada cigarrillo reduce tu vida 11 minutos. Un paquete al día = 7 años menos de vida.',
      },
      {
        id: 'años_fumando',
        type: 'number',
        label: '¿Cuántos años llevas fumando o fumaste?',
        placeholder: 'Ejemplo: 15',
        required: false,
        dependsOn: { fieldId: 'fuma', value: 'actual' },
        validation: { min: 0, max: 80 },
        tooltip: 'Esto ayuda a calcular "paquetes-año" (paquetes/día × años)',
      },
      {
        id: 'alcohol',
        type: 'select',
        label: '¿Consumes bebidas alcohólicas?',
        required: true,
        options: [
          { value: 'nunca', label: 'No bebo alcohol', explanation: '' },
          { value: 'ocasional', label: 'Ocasional (1-2 veces al mes)', explanation: 'Consumo bajo riesgo' },
          { value: 'moderado', label: 'Moderado (1-2 veces por semana)', explanation: 'Dentro de límites recomendados' },
          { value: 'frecuente', label: 'Frecuente (3-6 veces por semana)', explanation: 'Riesgo aumentado' },
          { value: 'diario', label: 'Diario', explanation: 'Riesgo alto de daño hepático' },
        ],
      },
      {
        id: 'ejercicio',
        type: 'select',
        label: '¿Haces ejercicio regularmente?',
        required: true,
        options: [
          { value: 'sedentario', label: 'No, soy sedentario', explanation: 'Riesgo equivalente a fumar' },
          { value: 'ligero', label: 'Ligero (caminar 30 min, 1-2 veces/semana)', explanation: 'Algo es mejor que nada' },
          { value: 'moderado', label: 'Moderado (30-60 min, 3-4 veces/semana)', explanation: '¡Muy bien! Cerca de lo óptimo' },
          { value: 'intenso', label: 'Intenso (>60 min, 5+ veces/semana)', explanation: '¡Excelente! Beneficio máximo' },
        ],
      },
      {
        id: 'horas_sueno',
        type: 'scale',
        label: '¿Cuántas horas duermes por noche normalmente?',
        required: true,
        validation: { min: 1, max: 12 },
        tooltip: 'Óptimo: 7-9 horas. <6 horas = riesgo de diabetes, obesidad, Alzheimer',
      },
      {
        id: 'dieta',
        type: 'select',
        label: '¿Cómo describirías tu alimentación?',
        required: true,
        options: [
          { value: 'muy_mala', label: 'Comida rápida y ultra-procesados frecuentemente', explanation: 'Riesgo muy alto' },
          { value: 'regular', label: 'Mezcla de procesados y comida casera', explanation: 'Hay espacio para mejorar' },
          { value: 'buena', label: 'Principalmente comida casera, balanceada', explanation: '¡Buen trabajo!' },
          { value: 'excelente', label: 'Dieta mediterránea, muchas verduras y frutas', explanation: '¡Óptimo para salud!' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 9: REVISIÓN POR SISTEMAS - Cardiovascular
  // ==========================================
  {
    id: 'cardiovascular',
    title: '❤️ Sistema Cardiovascular',
    subtitle: 'Tu corazón y circulación: el motor de la vida',
    category: 'revision_sistemas',
    completed: false,
    story: {
      intro: 'Un paciente de 50 años consulta por "cansancio". El médico pregunta: ¿te cuesta respirar al subir escaleras? "Sí, pero pensé que era normal por la edad". Examen: soplo cardíaco. Eco: válvula aórtica muy estrecha, necesita cirugía urgente. Si no se operaba en 3 meses, muerte súbita.',
      why: 'Los síntomas cardiovasculares son sutiles pero mortales. Dolor de pecho, falta de aire, hinchazón de piernas, palpitaciones... pueden ser la primera señal de infarto, insuficiencia cardíaca, arritmia peligrosa.',
      example: '🚨 SÍNTOMAS CARDIOVASCULARES QUE NO DEBES IGNORAR:\n\n💔 DOLOR DE PECHO:\n- Opresivo "como elefante sentado en pecho" = INFARTO\n- Punzante al respirar = posible pericarditis o embolia pulmonar\n- Ardor que sube = probablemente reflujo (pero confirmar)\n\n🫁 FALTA DE AIRE:\n- Al acostarse (ortopnea) = insuficiencia cardíaca\n- Súbita con dolor de pecho = embolia pulmonar (EMERGENCIA)\n- Progresiva con tos = puede ser corazón o pulmón\n\n🦵 HINCHAZÓN:\n- Ambas piernas = corazón, hígado o riñón\n- Una pierna = trombosis venosa (puede soltar émbolo al pulmón)',
      didYouKnow: '💡 TU CORAZÓN EN NÚMEROS:\n- Late 100,000 veces al día = 35 millones/año\n- Bombea 5 litros de sangre por minuto = 7,200 litros/día\n- Infarto: cada minuto perdido = 2 millones de células cardíacas muertas\n- Síntomas de infarto en MUJERES son diferentes: náusea, cansancio, dolor de espalda (no dolor de pecho típico)',
    },
    fields: [
      {
        id: 'dolor_pecho',
        type: 'boolean',
        label: '¿Has tenido dolor o molestia en el pecho?',
        required: true,
      },
      {
        id: 'dolor_pecho_detalle',
        type: 'textarea',
        label: 'Describe el dolor: ¿dónde, cuándo, cómo es?',
        placeholder: 'Ejemplo: Dolor en centro del pecho, opresivo, cuando subo escaleras, se va con reposo',
        required: false,
        dependsOn: { fieldId: 'dolor_pecho', value: true },
      },
      {
        id: 'falta_aire',
        type: 'boolean',
        label: '¿Te falta el aire o te cuesta respirar?',
        required: true,
      },
      {
        id: 'palpitaciones',
        type: 'boolean',
        label: '¿Sientes que tu corazón late rápido o irregular?',
        required: true,
      },
      {
        id: 'hinchazon_piernas',
        type: 'boolean',
        label: '¿Se te hinchan los pies o piernas?',
        required: true,
      },
      {
        id: 'sintomas_cardiovasculares',
        type: 'multiselect',
        label: '¿Has experimentado alguno de estos síntomas?',
        required: false,
        options: [
          { value: 'mareos', label: 'Mareos o desmayos', explanation: 'Puede indicar arritmia o presión baja' },
          { value: 'sudoracion', label: 'Sudoración fría sin razón', explanation: 'Síntoma de infarto' },
          { value: 'fatiga_extrema', label: 'Cansancio extremo inexplicable', explanation: 'Puede ser insuficiencia cardíaca' },
          { value: 'tos_nocturna', label: 'Tos al acostarse', explanation: 'Puede indicar líquido en pulmones por corazón' },
          { value: 'ninguno', label: 'Ninguno de estos', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 10: REVISIÓN POR SISTEMAS - Respiratorio
  // ==========================================
  {
    id: 'respiratorio',
    title: '🫁 Sistema Respiratorio',
    subtitle: 'Tus pulmones: la fábrica de oxígeno',
    category: 'revision_sistemas',
    completed: false,
    story: {
      intro: 'Una mujer joven consulta por "tos que no se quita". Lleva 3 semanas. "¿Tiene fiebre?" "No". "¿Fuma?" "No". "¿Le falta el aire?" "Un poco, al subir escaleras". Radiografía: tumor en pulmón. A los 32 años, nunca fumó. Cáncer de pulmón. Si hubiera esperado 2 meses más para consultar, inoperable.',
      why: 'La tos, la falta de aire, el dolor al respirar... son alarmas del sistema respiratorio. Pueden indicar desde asma (tratable) hasta cáncer de pulmón o embolia pulmonar (mortal en minutos).',
      example: '🚨 SÍNTOMAS RESPIRATORIOS IMPORTANTES:\n\n😮‍💨 TOS:\n- Tos >3 semanas = siempre investigar (no es "normal")\n- Tos con sangre = URGENTE (puede ser cáncer, tuberculosis, embolia)\n- Tos nocturna = puede ser asma, reflujo, o insuficiencia cardíaca\n\n🫁 FALTA DE AIRE:\n- Súbita = embolia pulmonar (EMERGENCIA)\n- Progresiva en fumador = EPOC\n- Con sibilancias = asma\n\n🤧 OTROS:\n- Ronquidos + pausas al dormir = apnea del sueño (aumenta riesgo de infarto 3x)\n- Dolor al respirar profundo = pleuresía, neumonia, o pericarditis',
      didYouKnow: '💡 TUS PULMONES EN NÚMEROS:\n- Respiras 20,000 veces al día\n- Superficie pulmonar = 70 m² (tamaño de una cancha de tenis)\n- Capacidad: 6 litros de aire\n- Fumadores pierden 150-250 ml de capacidad pulmonar por año\n- Apnea del sueño no tratada: aumenta riesgo de stroke 4x',
    },
    fields: [
      {
        id: 'tos',
        type: 'boolean',
        label: '¿Tienes tos persistente (más de 3 semanas)?',
        required: true,
      },
      {
        id: 'tos_detalle',
        type: 'textarea',
        label: 'Describe tu tos: ¿seca o con flema? ¿Cuándo es peor?',
        placeholder: 'Ejemplo: Tos seca por las noches, me despierta, llevo 5 semanas',
        required: false,
        dependsOn: { fieldId: 'tos', value: true },
      },
      {
        id: 'falta_aire_respiratorio',
        type: 'boolean',
        label: '¿Te falta el aire al hacer esfuerzos?',
        required: true,
      },
      {
        id: 'silbido_pecho',
        type: 'boolean',
        label: '¿Escuchas silbidos en el pecho al respirar?',
        required: true,
        tooltip: 'Sibilancias pueden indicar asma o EPOC',
      },
      {
        id: 'sintomas_respiratorios',
        type: 'multiselect',
        label: '¿Has experimentado alguno de estos síntomas?',
        required: false,
        options: [
          { value: 'sangre_tos', label: 'Sangre al toser', explanation: 'URGENTE - puede ser cáncer o tuberculosis' },
          { value: 'dolor_respirar', label: 'Dolor al respirar profundo', explanation: 'Puede ser pleuresía o neumonía' },
          { value: 'ronquidos', label: 'Ronquidos fuertes con pausas', explanation: 'Apnea del sueño - riesgo cardiovascular' },
          { value: 'flema_color', label: 'Flema amarilla o verde persistente', explanation: 'Puede indicar infección' },
          { value: 'ninguno', label: 'Ninguno de estos', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 11: REVISIÓN POR SISTEMAS - Digestivo
  // ==========================================
  {
    id: 'digestivo',
    title: '🍽️ Sistema Digestivo',
    subtitle: 'De la boca al ano: tu fábrica de nutrientes',
    category: 'revision_sistemas',
    completed: false,
    story: {
      intro: 'Un señor de 55 años llega por "acidez". Toma omeprazol hace 2 años, lo compra sin receta. El médico pregunta: ¿ha bajado de peso? "Sí, 8 kilos en 3 meses". Endoscopia: cáncer gástrico avanzado. El omeprazol solo tapaba el síntoma. El cáncer crecía silenciosamente.',
      why: 'El sistema digestivo da señales sutiles de problemas graves. Acidez persistente puede ser reflujo simple... o cáncer de estómago. Diarrea crónica puede ser intestino irritable... o enfermedad inflamatoria intestinal que necesita tratamiento urgente.',
      example: '🚨 SÍNTOMAS DIGESTIVOS DE ALARMA:\n\n⚠️ BANDERAS ROJAS (requieren estudio URGENTE):\n- Sangre en heces (roja o negra como alquitrán)\n- Pérdida de peso sin intentarlo (>5% en 6 meses)\n- Dificultad para tragar (disfagia)\n- Vómitos persistentes\n- Dolor abdominal intenso súbito\n\n🔍 SÍNTOMAS COMUNES PERO IMPORTANTES:\n- Acidez >2 veces/semana por >3 semanas = necesita endoscopia\n- Diarrea >4 semanas = no es "normal", investigar\n- Estreñimiento nuevo en >50 años = descartar cáncer colon\n- Hinchazón + diarrea = puede ser celiaquía o intolerancia',
      didYouKnow: '💡 TU SISTEMA DIGESTIVO EN NÚMEROS:\n- Intestino: 7-9 metros de largo\n- Produce 1-2 litros de saliva al día\n- Ácido del estómago puede disolver metal (pH 1-2)\n- Microbiota: 100 TRILLONES de bacterias (10x más que células humanas)\n- Colon absorbe 1.5 litros de agua al día de las heces',
    },
    fields: [
      {
        id: 'acidez',
        type: 'boolean',
        label: '¿Tienes acidez o reflujo frecuente?',
        required: true,
      },
      {
        id: 'dolor_abdominal',
        type: 'boolean',
        label: '¿Tienes dolor abdominal persistente?',
        required: true,
      },
      {
        id: 'cambio_habito_intestinal',
        type: 'select',
        label: '¿Has tenido cambios en tus hábitos intestinales?',
        required: true,
        options: [
          { value: 'no', label: 'No, todo normal', explanation: '' },
          { value: 'diarrea', label: 'Diarrea frecuente', explanation: 'Si >4 semanas, necesita estudio' },
          { value: 'estrenimiento', label: 'Estreñimiento', explanation: 'Si es nuevo, puede ser señal de alarma' },
          { value: 'alternante', label: 'Alterno entre diarrea y estreñimiento', explanation: 'Puede ser intestino irritable' },
        ],
      },
      {
        id: 'sintomas_digestivos',
        type: 'multiselect',
        label: '¿Has experimentado alguno de estos síntomas?',
        required: false,
        options: [
          { value: 'sangre_heces', label: 'Sangre en las heces', explanation: 'URGENTE - puede ser cáncer, hemorroides, o enfermedad inflamatoria' },
          { value: 'heces_negras', label: 'Heces negras como alquitrán', explanation: 'URGENTE - sangrado digestivo alto' },
          { value: 'perdida_peso', label: 'Pérdida de peso sin hacer dieta', explanation: 'Bandera roja - investigar' },
          { value: 'dificultad_tragar', label: 'Dificultad para tragar', explanation: 'Puede ser cáncer de esófago' },
          { value: 'nausea_vomito', label: 'Náusea o vómito persistente', explanation: 'Múltiples causas, necesita evaluación' },
          { value: 'hinchazon', label: 'Hinchazón abdominal constante', explanation: 'Puede ser intolerancia o celiaquía' },
          { value: 'ninguno', label: 'Ninguno de estos', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 12: REVISIÓN POR SISTEMAS - Genitourinario
  // ==========================================
  {
    id: 'genitourinario',
    title: '💧 Sistema Genitourinario',
    subtitle: 'Riñones y vías urinarias: tu sistema de filtración',
    category: 'revision_sistemas',
    completed: false,
    story: {
      intro: 'Un hombre de 60 años consulta porque "orina muchas veces en la noche". Piensa que es "normal de la edad". El médico pregunta: ¿le cuesta iniciar? ¿el chorro es débil? "Sí". Análisis PSA: muy elevado. Biopsia: cáncer de próstata. Tratado a tiempo, curable. Si esperaba 1 año más, con metástasis.',
      why: 'Los síntomas urinarios pueden indicar desde infección simple (tratable con antibióticos) hasta cáncer de riñón, vejiga o próstata. El dolor al orinar, la sangre en orina, orinar frecuente... son señales que no debes ignorar.',
      example: '🚨 SÍNTOMAS GENITOURINARIOS IMPORTANTES:\n\n🩸 SANGRE EN ORINA:\n- Visible (roja) = URGENTE (cáncer, cálculo, infección severa)\n- Microscópica (solo en análisis) = también requiere estudio\n- En hombre >40 años = descartar cáncer vejiga/riñón/próstata\n\n💧 SÍNTOMAS URINARIOS:\n- Orinar muchas veces = puede ser diabetes, próstata, infección\n- Dolor al orinar = infección urinaria (mujeres) o próstata (hombres)\n- Levantarse >2 veces en noche = nicturia (próstata, diabetes, apnea sueño)\n\n👨 HOMBRES:\n- Chorro débil + esfuerzo = próstata agrandada (benigna o cáncer)\n- Disfunción eréctil = primer síntoma de enfermedad cardiovascular',
      didYouKnow: '💡 TUS RIÑONES EN NÚMEROS:\n- Filtran 180 litros de sangre AL DÍA\n- Producen 1-2 litros de orina al día (99% del filtrado se reabsorbe)\n- Tienen 2 millones de nefronas (filtros microscópicos)\n- Pueden perder 50% de función sin dar síntomas\n- Diabetes e hipertensión causan 70% de insuficiencia renal',
    },
    fields: [
      {
        id: 'dolor_orinar',
        type: 'boolean',
        label: '¿Tienes dolor o ardor al orinar?',
        required: true,
      },
      {
        id: 'frecuencia_urinaria',
        type: 'select',
        label: '¿Has notado cambios en la frecuencia al orinar?',
        required: true,
        options: [
          { value: 'normal', label: 'No, todo normal', explanation: '' },
          { value: 'frecuente_dia', label: 'Orino muy frecuente durante el día', explanation: 'Puede ser diabetes, infección, próstata' },
          { value: 'frecuente_noche', label: 'Me levanto muchas veces en la noche', explanation: 'Nicturia - próstata, diabetes, apnea' },
          { value: 'urgencia', label: 'Urgencia súbita (casi no llego)', explanation: 'Puede ser vejiga hiperactiva o infección' },
        ],
      },
      {
        id: 'sintomas_genitourinarios',
        type: 'multiselect',
        label: '¿Has experimentado alguno de estos síntomas?',
        required: false,
        options: [
          { value: 'sangre_orina', label: 'Sangre en la orina', explanation: 'URGENTE - cáncer, cálculo, infección' },
          { value: 'chorro_debil', label: 'Chorro urinario débil o entrecortado', explanation: 'Próstata agrandada (hombres)' },
          { value: 'incontinencia', label: 'Pérdida involuntaria de orina', explanation: 'Múltiples causas, tiene tratamiento' },
          { value: 'dolor_lumbar', label: 'Dolor en la espalda baja (zona riñones)', explanation: 'Puede ser cálculo renal o infección' },
          { value: 'ninguno', label: 'Ninguno de estos', explanation: '' },
        ],
      },
    ],
  },

  // ==========================================
  // PASO 13: PANTALLA FINAL - Resumen y Envío
  // ==========================================
  {
    id: 'resumen_final',
    title: '✅ ¡Completaste tu Anamnesis!',
    subtitle: 'Resumen de tu historia clínica interactiva',
    category: 'revision_sistemas',
    completed: false,
    story: {
      intro: '🎉 ¡Felicidades! Has completado un recorrido educativo por tu historia clínica. Ahora entiendes mejor cómo piensan los médicos y por qué hacen las preguntas que hacen.',
      why: 'Esta información que compartiste es INVALUABLE para tu médico. Le permite conocerte antes de verte, pensar en diagnósticos precisos, y darte mejor atención. Has participado activamente en tu salud.',
      example: '📊 LO QUE LOGRASTE:\n\n✅ Completaste tu filiación y datos personales\n✅ Describiste tu motivo de consulta con detalle\n✅ Compartiste tus antecedentes médicos y familiares\n✅ Reportaste tus medicamentos y alergias\n✅ Analizaste tus hábitos de salud\n✅ Revisaste todos tus sistemas corporales\n\n🎓 APRENDISTE:\n- Cómo la edad cambia el pensamiento médico\n- Por qué los antecedentes familiares son importantes\n- Qué síntomas son banderas rojas\n- Cómo los hábitos afectan tu salud futura',
      didYouKnow: '💡 PRÓXIMOS PASOS:\n\n✅ Esta información se guardará en tu expediente\n✅ Tu médico la revisará ANTES de tu consulta\n✅ Puedes actualizar esta información cuando quieras\n✅ Recuerda: eres el experto en tu cuerpo, el médico es el experto en medicina\n✅ Juntos forman el mejor equipo para cuidar tu salud',
    },
    fields: [
      {
        id: 'confirma_informacion',
        type: 'boolean',
        label: '¿Confirmas que toda la información proporcionada es correcta?',
        required: true,
        tooltip: 'Es importante que toda la información sea veraz y completa',
      },
      {
        id: 'comentarios_adicionales',
        type: 'textarea',
        label: '¿Hay algo más que quieras que tu médico sepa?',
        placeholder: 'Ejemplo: Tengo mucho miedo a las agujas, preferencia por doctora mujer, cualquier otra información relevante...',
        required: false,
      },
    ],
  },
];
