import { afterEach, beforeAll, vi } from 'vitest'

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://auth.autamedica.test';
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})
