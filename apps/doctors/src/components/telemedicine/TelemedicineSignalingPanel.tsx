'use client';

import { TelemedicineSignalingPanel as SharedPanel } from '@autamedica/ui';
import type { TelemedicineRole } from '@autamedica/telemedicine';

interface TelemedicineSignalingPanelProps {
  roomId: string;
  userId: string;
  userType: TelemedicineRole;
  metadata?: Record<string, unknown>;
  className?: string;
}

export function TelemedicineSignalingPanel(props: TelemedicineSignalingPanelProps) {
  const signalingUrl = 'ws://localhost:3005/signal';
  const iceCandidateStyle = {
    bg: 'bg-purple-500/10',
    text: 'text-purple-200',
  };

  return <SharedPanel {...props} signalingUrl={signalingUrl} iceCandidateStyle={iceCandidateStyle} />;
}