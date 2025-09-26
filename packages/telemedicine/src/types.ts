export type SignalKind =
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'join'
  | 'leave'
  | 'error'

export type Signal =
  | { kind: 'offer'; sdp: RTCSessionDescriptionInit; roomId: string; from: string; to?: string }
  | { kind: 'answer'; sdp: RTCSessionDescriptionInit; roomId: string; from: string; to?: string }
  | { kind: 'ice-candidate'; candidate: RTCIceCandidateInit; roomId: string; from: string; to?: string }
  | { kind: 'join'; roomId: string; userId: string; userType?: string }
  | { kind: 'leave'; roomId: string; userId: string }
  | { kind: 'error'; message: string }

export function isSignal(value: unknown): value is Signal {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as { kind?: unknown }
  if (typeof candidate.kind !== 'string') {
    return false
  }

  return ['offer', 'answer', 'ice-candidate', 'join', 'leave', 'error'].includes(candidate.kind)
}
