export { loadIceServers, ICE_STUN_ONLY, ICE_WITH_TURN, loadSignalingUrl } from './ice-servers'

// Legacy exports for compatibility
export { loadIceServers as getIceServersConfig } from './ice-servers'
export function validateIceServersConfig() { return true }
export { ICE_STUN_ONLY as getExampleIceServersConfig } from './ice-servers'
export type IceServerConfig = RTCIceServer