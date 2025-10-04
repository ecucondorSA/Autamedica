import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  icon?: ReactNode;
}

export function AuthCard({ children, onClick, selected = false, icon }: AuthCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        p-6
        bg-[var(--au-surface)]
        border-2
        rounded-xl
        transition-all
        duration-200
        text-left
        flex
        items-start
        gap-4
        ${selected
          ? 'border-[var(--au-accent)] shadow-lg shadow-[var(--au-accent)]/20'
          : 'border-[var(--au-border)] hover:border-[var(--au-hover-border)] hover:bg-[var(--au-hover)]'
        }
      `}
    >
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--au-hover)] border border-[var(--au-border)] flex items-center justify-center text-[var(--au-text-primary)]">
          {icon}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </button>
  );
}
