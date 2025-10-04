import Image from 'next/image';

interface AuthLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function AuthLogo({ size = 'md' }: AuthLogoProps) {
  const sizes = {
    sm: {
      dimension: 64,
      containerClass: 'w-16 h-16',
      borderClass: 'border-2'
    },
    md: {
      dimension: 96,
      containerClass: 'w-24 h-24',
      borderClass: 'border-[3px]'
    },
    lg: {
      dimension: 128,
      containerClass: 'w-32 h-32',
      borderClass: 'border-4'
    },
  };

  const { dimension, containerClass, borderClass } = sizes[size];

  return (
    <div className={`
      ${containerClass}
      ${borderClass}
      mx-auto
      mb-6
      rounded-full
      border-[var(--au-border)]
      bg-[var(--au-surface)]
      p-2
      shadow-lg
      flex
      items-center
      justify-center
      overflow-hidden
    `}>
      <Image
        src="/autamedica-logo.png"
        alt="AUTAMEDICA Logo"
        width={dimension}
        height={dimension}
        className="object-contain rounded-full"
        priority
      />
    </div>
  );
}
