import { PublicRoleSelectionForm } from './components/PublicRoleSelectionForm';
import { AuthLogo } from '@/components/AuthLogo';

export default function SelectRolePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--au-bg)]">
      <div className="w-full max-w-2xl">
        <div className="bg-[var(--au-surface)] border-2 border-[var(--au-border)] rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <AuthLogo size="md" />
            <h1 className="text-2xl font-bold text-[var(--au-text-primary)] mb-2">
              ¡Bienvenido a AutaMedica!
            </h1>
            <p className="text-[var(--au-text-secondary)]">
              Selecciona tu rol profesional para continuar
            </p>
          </div>

          {/* Form Content */}
          <PublicRoleSelectionForm />

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[var(--au-border)]">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-[var(--au-text-tertiary)]">Plataforma médica segura</span>
          </div>
        </div>
      </div>
    </div>
  );
}