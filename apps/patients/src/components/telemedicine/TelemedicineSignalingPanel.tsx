'use client';

import { TelemedicineSignalingPanel as SharedPanel } from '@autamedica/ui';
import { getClientEnvOrDefault } from '@autamedica/shared';
import type { TelemedicineRole } from '@autamedica/telemedicine';

interface TelemedicineSignalingPanelProps {
  roomId: string;
  userId: string;
  userType: TelemedicineRole;
  metadata?: Record<string, unknown>;
  className?: string;
}

export function TelemedicineSignalingPanel(props: TelemedicineSignalingPanelProps) {
  const signalingUrl = getClientEnvOrDefault('NEXT_PUBLIC_SIGNALING_URL', 'ws://localhost:3005/signal');

  return <SharedPanel {...props} signalingUrl={signalingUrl} />;
}