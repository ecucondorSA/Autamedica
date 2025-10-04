// Store simplificado para pacientes
export const useMedicalHistoryStore = () => ({
  addEntry: async (entry: any) => logger.info('Entry added:', entry),
  suggestPrescriptions: async () => [],
  analyzeVitals: async () => null
})