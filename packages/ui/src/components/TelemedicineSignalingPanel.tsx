'use client';

import { useMemo } from 'react';
import { useTelemedicineSignaling } from '@autamedica/hooks';
import type { TelemedicineRole } from '@autamedica/telemedicine';
import type { SignalingConnectionState } from '@autamedica/hooks';
import { logger } from '@autamedica/shared';

interface TelemedicineSignalingPanelProps {
  roomId: string;
  userId: string;
  userType: TelemedicineRole;
  metadata?: Record<string, unknown>;
  className?: string;
  signalingUrl: string;
  iceCandidateStyle?: {
    bg: string;
    text: string;
  };
}

export function TelemedicineSignalingPanel({
  roomId,
  userId,
  userType,
  metadata,
  className,
  signalingUrl,
  iceCandidateStyle,
}: TelemedicineSignalingPanelProps) {
  const { state, controls } = useTelemedicineSignaling({
    roomId,
    userId,
    userType,
    metadata,
    signalingUrl,
  });

  const participantSummary = useMemo(() => {
    if (state.participants.length === 0) {
      return 'En espera de participantes';
    }
    return state.participants
      .map((participant) => `${participant.userType === 'doctor' ? '👨‍⚕️' : '🧑‍⚕️'} ${participant.id}`)
      .join(', ');
  }, [state.participants]);

  const statusBadge = getStatusBadge(state.connectionState);

  const iceCandidateDefaultStyle = {
    bg: 'bg-stone-50',
    text: 'text-stone-900',
  };

  const iceStyle = iceCandidateStyle || iceCandidateDefaultStyle;

  return (
    <div
      className={
        className ??
        'rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">Conexión de señalización</h4>
          <p className="text-xs text-slate-400">Sala actual: {roomId}</p>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusBadge.background} ${statusBadge.color}`}
        >
          <span>●</span>
          {statusBadge.label}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400"
          onClick={() => {
            controls.connect().catch((error) => logger.error('[Telemedicina] error al conectar', error));
          }}
        >
          Conectar
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          onClick={() => controls.disconnect()}
        >
          Desconectar
        </button>
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-300">
        <div>
          <p className="font-semibold text-slate-200">Participantes</p>
          <p className="text-slate-400">{participantSummary}</p>
        </div>
        {state.lastOffer && (
          <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-2">
            <p className="font-semibold text-blue-200">Oferta recibida</p>
            <p className="text-[11px] text-blue-100">De: {state.lastOffer.from}</p>
          </div>
        )}
        {state.lastAnswer && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2">
            <p className="font-semibold text-emerald-200">Respuesta recibida</p>
            <p className="text-[11px] text-emerald-100">De: {state.lastAnswer.from}</p>
          </div>
        )}
        {state.lastCandidate && (
          <div className={`rounded-md border border-stone-300 p-2 ${iceStyle.bg}`}>
            <p className={`font-semibold ${iceStyle.text}`}>ICE candidate</p>
            <p className={`text-[11px] ${iceStyle.text}`}>Origen: {state.lastCandidate.from}</p>
          </div>
        )}
        {state.error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-200">
            Error: {state.error.message}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(state: SignalingConnectionState) {
  switch (state) {
    case 'connected':
      return { label: 'Conectado', color: 'text-emerald-200', background: 'bg-emerald-500/10' };
    case 'connecting':
      return { label: 'Conectando…', color: 'text-blue-200', background: 'bg-blue-500/10' };
    case 'reconnecting':
      return { label: 'Reconectando…', color: 'text-yellow-200', background: 'bg-yellow-500/10' };
    case 'disconnected':
      return { label: 'Desconectado', color: 'text-slate-300', background: 'bg-slate-600/20' };
    default:
      return { label: 'Inactivo', color: 'text-slate-300', background: 'bg-slate-600/20' };
  }
}
