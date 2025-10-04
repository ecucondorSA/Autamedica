import { ReactNode } from 'react';

interface AuthButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

export function AuthButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  loading = false,
}: AuthButtonProps) {
  const baseStyles = `
    px-6
    py-3
    rounded-xl
    font-medium
    transition-all
    duration-200
    flex
    items-center
    justify-center
    gap-2
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variants = {
    primary: `
      bg-[var(--au-accent)]
      text-[var(--au-bg)]
      border-2
      border-[var(--au-accent)]
      ${!disabled && !loading ? 'hover:bg-[var(--au-text-primary)] hover:border-[var(--au-text-primary)]' : ''}
    `,
    secondary: `
      bg-[var(--au-surface)]
      text-[var(--au-text-primary)]
      border-2
      border-[var(--au-border)]
      ${!disabled && !loading ? 'hover:border-[var(--au-hover-border)] hover:bg-[var(--au-hover)]' : ''}
    `,
    ghost: `
      bg-transparent
      text-[var(--au-text-secondary)]
      border-2
      border-transparent
      ${!disabled && !loading ? 'hover:text-[var(--au-text-primary)] hover:border-[var(--au-border)]' : ''}
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
