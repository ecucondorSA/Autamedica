import { PublicRoleSelectionForm } from './components/PublicRoleSelectionForm';

export default function SelectRolePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6" style={{backgroundColor: '#0f0f10'}}>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl xl:max-w-2xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="rounded-lg sm:rounded-xl shadow-2xl border flex-1 flex flex-col relative" style={{backgroundColor: '#1a1a1a', borderColor: '#333333', backdropFilter: 'blur(10px)'}}>
          {/* Header responsivo */}
          <div className="text-center p-3 sm:p-4 pb-2 relative flex-shrink-0">
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ¡Bienvenido a AutaMedica!
              </h1>

              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                Selecciona tu rol profesional para continuar
              </p>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-1 sm:py-2">
            <PublicRoleSelectionForm />
          </div>

          {/* Footer minimalista */}
          <div className="p-2 sm:p-3 border-t border-gray-700/50 text-center relative flex-shrink-0">
            {/* Indicador de seguridad */}
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden sm:inline">Plataforma médica segura</span>
              <span className="sm:hidden">Plataforma segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}