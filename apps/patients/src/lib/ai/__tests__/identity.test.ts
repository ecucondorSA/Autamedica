import { describe, expect, it } from 'vitest'
import { intentClassifier } from '../../lib/ai/intent-classifier'
import { medicalQA, type PatientContext } from '../../lib/ai/medical-qa'

describe('Auta AI - identidad del paciente', () => {
  it('clasifica preguntas de nombre como intent identity', () => {
    const samples = [
      'cual es mi nombre',
      '¿Cuál es mi nombre?',
      'como me llamo',
      'cómo me llamo',
      'nombre',
    ]
    for (const s of samples) {
      const c = intentClassifier.classify(s)
      expect(c.intent).toBe('identity')
    }
  })

  it('responde con el nombre cuando está disponible', () => {
    const ctx: PatientContext = { profile: { name: 'Ana Paciente', email: 'ana@example.com' } }
    const c = intentClassifier.classify('¿Cuál es mi nombre?')
    const res = medicalQA.generateResponse(c, ctx)
    expect(res.text).toContain('Ana Paciente')
  })

  it('si no hay nombre, cae al email', () => {
    const ctx: PatientContext = { profile: { name: null, email: 'ana@example.com' } }
    const c = intentClassifier.classify('como me llamo')
    const res = medicalQA.generateResponse(c, ctx)
    expect(res.text).toContain('ana@example.com')
  })
})
