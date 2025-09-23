import { z } from 'zod'

const baseMessageSchema = z.object({
  type: z.enum(['join', 'leave', 'offer', 'answer', 'ice-candidate', 'user-joined', 'user-left', 'error']),
  from: z.string().min(1),
  roomId: z.string().min(1),
  to: z.string().optional(),
  data: z.unknown().optional(),
})

export type SignalingEnvelope = z.infer<typeof baseMessageSchema>

const joinSchema = baseMessageSchema.extend({
  type: z.literal('join'),
  data: z.object({
    userType: z.enum(['doctor', 'patient', 'unknown']).default('unknown'),
    metadata: z.record(z.unknown()).optional(),
  }),
})

export function validateJoinPayload(message: SignalingEnvelope) {
  return joinSchema.safeParse(message)
}
