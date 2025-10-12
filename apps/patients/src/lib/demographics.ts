export type NormalizedGender = 'male' | 'female' | null

export function computeAgeFromIso(iso?: string | null): number | null {
  if (!iso) return null
  const dob = new Date(iso)
  if (isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age >= 0 && age < 140 ? age : null
}

export function normalizeGender(input?: string | null): NormalizedGender {
  if (!input) return null
  const v = String(input).toLowerCase().trim()
  if (v === 'female' || v === 'f' || v === 'mujer' || v === 'femenino') return 'female'
  if (v === 'male' || v === 'm' || v === 'hombre' || v === 'masculino') return 'male'
  return null
}

export function deriveAgeAndGender(
  primary?: { birthDate?: string | null; gender?: string | null } | null,
  fallback?: { birthDate?: string | null; gender?: string | null } | null,
): { age: number | null; gender: NormalizedGender } {
  const birth = primary?.birthDate ?? fallback?.birthDate ?? null
  const g = primary?.gender ?? fallback?.gender ?? null
  return {
    age: computeAgeFromIso(birth),
    gender: normalizeGender(g),
  }
}

