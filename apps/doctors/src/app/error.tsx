'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console for debugging
    logger.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-16 w-16 text-red-500 mb-6">
            <AlertCircle size={64} />
          </div>

          <h1 className="text-3xl font-bold text-slate-100">
            Algo salió mal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ha ocurrido un error inesperado en el portal médico.
          </p>

          {error.message && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
              <p className="text-sm text-red-300 font-mono">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={reset}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-950 transition-colors duration-200"
          >
            <RefreshCw size={16} className="mr-2" />
            Reintentar
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="group relative w-full flex justify-center py-3 px-4 border border-slate-600 text-sm font-medium rounded-lg text-slate-300 bg-transparent hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-950 transition-colors duration-200"
          >
            Volver al Dashboard
          </button>

          <div className="text-center">
            <span className="text-slate-400 text-sm">
              Si el problema persiste, {' '}
              <a
                href="mailto:support@autamedica.com?subject=Error en Portal Médico"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                contactar soporte técnico
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}