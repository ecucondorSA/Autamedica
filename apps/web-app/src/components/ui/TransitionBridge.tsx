'use client';

interface TransitionBridgeProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'minimal';
}

export default function TransitionBridge({
  title,
  subtitle,
  variant = 'default'
}: TransitionBridgeProps) {
  return (
    <div className={`transition-bridge ${variant}`}>
      <div className="bridge-content">
        {title && (
          <div className="bridge-line-wrapper">
            <div className="bridge-line" />
            {title && (
              <div className="bridge-text">
                <h3 className="bridge-title">{title}</h3>
                {subtitle && <p className="bridge-subtitle">{subtitle}</p>}
              </div>
            )}
            <div className="bridge-line" />
          </div>
        )}
        {!title && <div className="bridge-line-full" />}
      </div>

      <style jsx>{`
        .transition-bridge {
          position: relative;
          width: 100%;
          min-height: clamp(80px, 10vh, 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(2rem, 4vh, 4rem) clamp(1rem, 3vw, 2rem);
          overflow: hidden;
        }

        .transition-bridge.default {
          background: linear-gradient(180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(20, 20, 20, 0.3) 50%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .transition-bridge.gradient {
          background: linear-gradient(180deg,
            #0a0a0a 0%,
            #141414 50%,
            #0a0a0a 100%
          );
        }

        .transition-bridge.minimal {
          background: transparent;
          min-height: 60px;
          padding: 1rem;
        }

        .bridge-content {
          width: 100%;
          max-width: 1200px;
          position: relative;
        }

        .bridge-line-wrapper {
          display: flex;
          align-items: center;
          gap: 2rem;
          width: 100%;
        }

        .bridge-line,
        .bridge-line-full {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(212, 212, 212, 0.3) 20%,
            rgba(212, 212, 212, 0.6) 50%,
            rgba(212, 212, 212, 0.3) 80%,
            transparent 100%
          );
          position: relative;
          overflow: hidden;
        }

        .bridge-line::after,
        .bridge-line-full::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .bridge-text {
          flex-shrink: 0;
          text-align: center;
          padding: 0 1rem;
        }

        .bridge-title {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .bridge-subtitle {
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
          color: rgba(255, 255, 255, 0.6);
          margin: 0.25rem 0 0 0;
        }

        @media (max-width: 768px) {
          .bridge-line-wrapper {
            gap: 1rem;
          }

          .bridge-text {
            padding: 0 0.5rem;
          }

          .transition-bridge {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
