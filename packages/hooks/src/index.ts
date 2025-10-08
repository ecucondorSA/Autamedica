// Hooks médicos
export { usePatients, useAppointments } from "./medical";

// Hooks de utilidad
export { useAsync, useDebounce } from "./utils";

// Re-export hooks de telemedicine con alias
export {
  useTelemedicineClient,
  useMediaControls,
  useRtcStats,
} from "@autamedica/telemedicine";

// Alias para compatibilidad
export { useTelemedicineClient as useTelemedicineSignaling } from "@autamedica/telemedicine";

// Re-export tipos de telemedicine
export type {
  TelemedicineClientState,
  TelemedicineClientActions,
  TelemedicineClientHook,
  MediaControlsState,
  MediaControlsActions,
  MediaControlsHook,
  RtcStatsData,
  RtcStatsState,
  RtcStatsActions,
  RtcStatsHook,
} from "@autamedica/telemedicine";