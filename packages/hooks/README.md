# ⚛️ @autamedica/hooks

> **React Hooks médicos especializados** para la plataforma AutaMedica.
> Hooks reutilizables para gestión de datos médicos, sesiones y integraciones con Supabase.

## 🎯 **Características**

- 🏥 **Hooks médicos** especializados para datos clínicos
- 🔄 **Integración Supabase** automática con cache
- 📊 **Gestión de estado** médico consistente
- ⚡ **Optimización de rendimiento** con memoización
- 🔐 **Autenticación médica** integrada
- 🧪 **Validación de datos** médicos en tiempo real

## 📦 **Instalación**

```bash
pnpm add @autamedica/hooks
```

## 🚀 **Hooks Médicos Principales**

### **usePatientData**
Gestión completa de datos de pacientes con Supabase.

```typescript
import { usePatientData } from '@autamedica/hooks'

function DoctorDashboard() {
  const { patient, loading, error, refresh } = usePatientData(patientId)

  if (loading) return <MedicalSpinner />
  if (error) return <ErrorAlert message={error} />

  return (
    <PatientCard>
      <h2>{patient?.full_name}</h2>
      <p>Edad: {patient?.age} años</p>
      <p>Tipo de sangre: {patient?.blood_type}</p>
      <button onClick={refresh}>Actualizar datos</button>
    </PatientCard>
  )
}
```

### **useActiveSession**
Gestión de sesiones médicas activas.

```typescript
import { useActiveSession } from '@autamedica/hooks'

function VideoCallContainer() {
  const {
    session,
    loading,
    error,
    startSession,
    endSession
  } = useActiveSession()

  const handleStartConsultation = async () => {
    await startSession(patientId, 'general')
  }

  return (
    <div>
      {session ? (
        <ActiveSessionPanel
          session={session}
          onEnd={endSession}
        />
      ) : (
        <button onClick={handleStartConsultation}>
          Iniciar Consulta
        </button>
      )}
    </div>
  )
}
```

### **useMedicalHistory**
Historial médico completo del paciente.

```typescript
import { useMedicalHistory } from '@autamedica/hooks'

function MedicalHistoryTab({ patientId }: { patientId: UUID }) {
  const {
    history,
    loading,
    error,
    addRecord,
    updateRecord
  } = useMedicalHistory(patientId)

  const handleAddRecord = async (recordData: MedicalRecordInput) => {
    await addRecord(recordData)
  }

  return (
    <MedicalHistoryList>
      {history.map(record => (
        <MedicalRecordCard
          key={record.id}
          record={record}
          onUpdate={updateRecord}
        />
      ))}
      <AddRecordButton onClick={handleAddRecord} />
    </MedicalHistoryList>
  )
}
```

### **useVitalSigns**
Signos vitales en tiempo real.

```typescript
import { useVitalSigns } from '@autamedica/hooks'

function VitalSignsMonitor({ patientId }: { patientId: UUID }) {
  const {
    vitals,
    latest,
    loading,
    recordVitals,
    getTrends
  } = useVitalSigns(patientId)

  const trends = getTrends('7d') // Últimos 7 días

  return (
    <VitalSignsPanel>
      <LatestVitals data={latest} />
      <VitalsTrendsChart data={trends} />
      <RecordVitalsForm onSubmit={recordVitals} />
    </VitalSignsPanel>
  )
}
```

### **usePrescriptions**
Gestión de prescripciones médicas.

```typescript
import { usePrescriptions } from '@autamedica/hooks'

function PrescriptionsTab({ patientId }: { patientId: UUID }) {
  const {
    prescriptions,
    activeMedications,
    loading,
    error,
    addPrescription,
    updateStatus
  } = usePrescriptions(patientId)

  const handleNewPrescription = async (prescription: PrescriptionInput) => {
    await addPrescription(prescription)
  }

  return (
    <PrescriptionsContainer>
      <ActiveMedicationsList medications={activeMedications} />
      <PrescriptionHistory prescriptions={prescriptions} />
      <NewPrescriptionForm onSubmit={handleNewPrescription} />
    </PrescriptionsContainer>
  )
}
```

### **useAIAnalysis**
Análisis de IA médica.

```typescript
import { useAIAnalysis } from '@autamedica/hooks'

function AIInsightsPanel({ patientId }: { patientId: UUID }) {
  const {
    analyses,
    loading,
    generateAnalysis,
    getInsights
  } = useAIAnalysis(patientId)

  const handleGenerateInsights = async () => {
    const insights = await generateAnalysis({
      patientId,
      includeVitals: true,
      includeMedications: true,
      includeHistory: true
    })
    return insights
  }

  return (
    <AIAnalysisPanel>
      {analyses.map(analysis => (
        <AIInsightCard key={analysis.id} analysis={analysis} />
      ))}
      <GenerateInsightsButton onClick={handleGenerateInsights} />
    </AIAnalysisPanel>
  )
}
```

## 🛠️ **Hooks de Utilidad**

### **useAsync**
Manejo consistente de operaciones asíncronas.

```typescript
import { useAsync } from '@autamedica/hooks'

function DataComponent() {
  const {
    data,
    loading,
    error,
    execute,
    reset
  } = useAsync(fetchMedicalData)

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <DataDisplay data={data} />}
      <button onClick={execute}>Recargar</button>
    </div>
  )
}
```

### **useDebounce**
Optimización de búsquedas médicas.

```typescript
import { useDebounce } from '@autamedica/hooks'

function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { patients } = usePatientSearch(debouncedSearch)

  return (
    <SearchContainer>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar pacientes..."
      />
      <PatientList patients={patients} />
    </SearchContainer>
  )
}
```

### **useLocalStorage**
Persistencia local de configuraciones médicas.

```typescript
import { useLocalStorage } from '@autamedica/hooks'

function DoctorPreferences() {
  const [theme, setTheme] = useLocalStorage('doctor-theme', 'dark')
  const [layout, setLayout] = useLocalStorage('doctor-layout', 'vscode')

  return (
    <PreferencesPanel>
      <ThemeSelector value={theme} onChange={setTheme} />
      <LayoutSelector value={layout} onChange={setLayout} />
    </PreferencesPanel>
  )
}
```

## 🔧 **Hooks de Configuración**

### **useMediaPermissions**
Gestión de permisos de cámara y micrófono.

```typescript
import { useMediaPermissions } from '@autamedica/hooks'

function VideoCallControls() {
  const {
    hasVideoPermission,
    hasAudioPermission,
    requestPermissions,
    stream,
    error
  } = useMediaPermissions()

  return (
    <ControlsPanel>
      <VideoToggle
        enabled={hasVideoPermission}
        stream={stream}
      />
      <AudioToggle
        enabled={hasAudioPermission}
        stream={stream}
      />
      {!hasVideoPermission && (
        <button onClick={requestPermissions}>
          Solicitar Permisos
        </button>
      )}
    </ControlsPanel>
  )
}
```

### **useWebRTC**
Gestión de conexiones WebRTC para videollamadas.

```typescript
import { useWebRTC } from '@autamedica/hooks'

function VideoCallRoom({ sessionId }: { sessionId: UUID }) {
  const {
    localStream,
    remoteStream,
    connectionState,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio
  } = useWebRTC(sessionId)

  return (
    <VideoCallContainer>
      <LocalVideo stream={localStream} />
      <RemoteVideo stream={remoteStream} />
      <CallControls
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onHangup={disconnect}
        connectionState={connectionState}
      />
    </VideoCallContainer>
  )
}
```

## 📊 **Hooks de Analytics**

### **useMedicalAnalytics**
Analytics médicos y métricas de rendimiento.

```typescript
import { useMedicalAnalytics } from '@autamedica/hooks'

function DoctorAnalyticsDashboard() {
  const {
    consultationMetrics,
    patientSatisfaction,
    responseTime,
    trackEvent
  } = useMedicalAnalytics()

  useEffect(() => {
    trackEvent('dashboard_viewed', {
      doctorId: currentDoctorId,
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <AnalyticsDashboard>
      <MetricCard
        title="Consultas Hoy"
        value={consultationMetrics.today}
      />
      <MetricCard
        title="Satisfacción"
        value={`${patientSatisfaction}%`}
      />
      <MetricCard
        title="Tiempo Respuesta"
        value={`${responseTime}min`}
      />
    </AnalyticsDashboard>
  )
}
```

## 🔒 **Hooks de Autenticación**

### **useAuth**
Autenticación médica integrada.

```typescript
import { useAuth } from '@autamedica/hooks'

function ProtectedComponent() {
  const {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole
  } = useAuth()

  if (loading) return <AuthSpinner />
  if (!isAuthenticated) return <LoginForm onLogin={login} />
  if (!hasRole(['doctor', 'specialist'])) {
    return <UnauthorizedMessage />
  }

  return (
    <AuthenticatedContent>
      <WelcomeMessage user={user} />
      <LogoutButton onClick={logout} />
    </AuthenticatedContent>
  )
}
```

## 🧪 **Testing de Hooks**

```typescript
import { renderHook, act } from '@testing-library/react'
import { usePatientData } from '@autamedica/hooks'

describe('usePatientData', () => {
  test('should load patient data correctly', async () => {
    const { result } = renderHook(() =>
      usePatientData('550e8400-e29b-41d4-a716-446655440000')
    )

    expect(result.current.loading).toBe(true)

    await act(async () => {
      // Wait for data to load
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.patient).toBeDefined()
    expect(result.current.patient?.full_name).toBe('María González')
  })
})
```

## 🔧 **Configuración**

### **Providers Requeridos**
```typescript
import { AuthProvider } from '@autamedica/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <YourApp />
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

## 📦 **Dependencies**

- `react`: ^18.2.0
- `@tanstack/react-query`: Para cache y estado server
- `@autamedica/types`: Tipos médicos compartidos
- `@autamedica/auth`: Autenticación médica
- `@supabase/supabase-js`: Integración base de datos

## 🔧 **Scripts**

```bash
pnpm build        # Compilar TypeScript
pnpm type-check   # Verificar tipos
pnpm lint         # ESLint con reglas médicas
pnpm test         # Tests de hooks
```

## 📄 **Licencia**

Proprietary - AutaMedica Healthcare Platform © 2025