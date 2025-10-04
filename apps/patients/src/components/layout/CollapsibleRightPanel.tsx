'use client'

import { useState } from 'react'
import {
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react'
import { DynamicRightPanel } from './DynamicRightPanel'

interface CollapsibleRightPanelProps {
  context?: 'dashboard' | 'video' | 'appointments' | 'history'
}

export function CollapsibleRightPanel({ context = 'dashboard' }: CollapsibleRightPanelProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('right-panel-open')
    return saved === null ? true : saved === 'true'
  })

  const togglePanel = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem('right-panel-open', String(newState))
  }

  return (
    <>
      {/* Panel flotante cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={togglePanel}
          className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-white shadow-lg transition hover:bg-stone-900 hover:scale-110"
          aria-label="Abrir panel lateral"
        >
          <PanelRightOpen className="h-5 w-5" />
        </button>
      )}

      {/* Panel deslizable */}
      <div
        className={`fixed right-0 top-0 z-30 h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
        <div className="relative h-full">
          {/* Botón de cerrar */}
          <button
            onClick={togglePanel}
            className="absolute -left-10 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-white shadow-lg transition hover:bg-stone-900"
            aria-label="Cerrar panel lateral"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>

          {/* Contenido del panel */}
          <DynamicRightPanel context={context} />
        </div>
      </div>

      {/* Overlay cuando está abierto (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={togglePanel}
        />
      )}
    </>
  )
}
