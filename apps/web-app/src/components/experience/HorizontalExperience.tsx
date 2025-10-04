"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { getAppUrl } from "@/lib/env";
import ProfessionalPatientsFeatures from "@/components/landing/ProfessionalPatientsFeatures";
import ProfessionalDoctorsFeatures from "@/components/landing/ProfessionalDoctorsFeatures";
import ProfessionalCompaniesFeatures from "@/components/landing/ProfessionalCompaniesFeatures";
import VideoGrid from "@/components/landing/VideoGrid";

type Panel = {
  title: string;
  items?: string[];
  ctaHref: string;
  component?: React.ComponentType;
};

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

 
export default function HorizontalExperience({ onLeaveTo: _onLeaveTo = "/model-viewer" }: { onLeaveTo?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  const panels: Panel[] = [
    {
      title: "Pacientes",
      ctaHref: getAppUrl("/", "patients"),
      component: ProfessionalPatientsFeatures,
    },
    {
      title: "Médicos",
      ctaHref: getAppUrl("/", "doctors"),
      component: ProfessionalDoctorsFeatures,
    },
    {
      title: "Empresas",
      ctaHref: getAppUrl("/", "companies"),
      component: ProfessionalCompaniesFeatures,
    },
    {
      title: "Ecosistema",
      ctaHref: "/model-viewer",
      component: VideoGrid,
    },
  ];

  const slideBackgrounds = [
    "linear-gradient(135deg, #101010, #181818)",
    "linear-gradient(135deg, #f2f2f2, #d8d8d8)",
    "linear-gradient(135deg, #111111, #1a1a1a)",
    "linear-gradient(135deg, #0a0a0a, #141414)",
  ];

  useLayoutEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slideRefs.current = [];

    mm.add(
      {
        desktop: "(min-width:1025px)",
        reduced: "(prefers-reduced-motion: reduce)"
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };

        if (reduced || !desktop) {
          return;
        }

        const container = containerRef.current!;
        const track = trackRef.current!;
        const slides = slideRefs.current;
        const total = panels.length;

        // Simple horizontal scroll animation - Faster scroll (reduced from 3x to 1.5x)
        const scrollDistance = total * window.innerHeight * 1.5;

        const anim = gsap.to(track, {
          x: () => -(total - 1) * window.innerWidth,
          ease: "power1.inOut",
        });

        stRef.current = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 0.5,
          animation: anim,
          onEnter: () => {
            // Disable body scroll and internal scrolls
            document.body.style.overflow = 'hidden';
          },
          onLeave: () => {
            // Re-enable body scroll
            document.body.style.overflow = '';
          },
          onEnterBack: () => {
            // Disable body scroll when scrolling back
            document.body.style.overflow = 'hidden';
          },
          onLeaveBack: () => {
            // Re-enable body scroll
            document.body.style.overflow = '';
          },
          onUpdate: (self) => {
            const i = Math.round(self.progress * (total - 1));
            if (i !== activeIndexRef.current) {
              activeIndexRef.current = i;
              setActiveIndex(i);
            }

            // Fade transitions between panels
            slides.forEach((slide, idx) => {
              if (!slide) return;

              const slideProgress = self.progress * (total - 1);
              const distance = Math.abs(slideProgress - idx);

              if (distance < 1) {
                const opacity = 1 - distance;
                const scale = 0.95 + (0.05 * opacity);
                gsap.to(slide, {
                  opacity,
                  scale,
                  duration: 0.3,
                  ease: "power2.out"
                });
              } else {
                gsap.to(slide, {
                  opacity: 0,
                  scale: 0.95,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }
            });
          },
        });

        return () => {
          anim.kill();
          if (stRef.current) {
            stRef.current.kill();
            stRef.current = null;
          }
        };
      }
    );

    return () => {
      mm.revert();
    };
  }, [panels.length]);

  const goToSlide = (targetIndex: number) => {
    const total = panels.length;
    const clamped = Math.max(0, Math.min(targetIndex, total - 1));
    const scrollDistance = total * window.innerHeight * 1.5;
    const distance = (clamped / (total - 1)) * scrollDistance;

    const st = stRef.current;
    if (st) {
      const targetY = st.start + distance;
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: targetY, autoKill: false },
        ease: "power2.inOut",
        onUpdate: () => ScrollTrigger.update(),
      });
    }

    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
  };

  useLayoutEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = Math.max(0, Math.min(panels.length - 1, activeIndexRef.current + dir));
      goToSlide(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panels.length]);

  return (
    <div
      ref={containerRef}
      className="horizontal-scroll-container"
      role="region"
      aria-label="Recorrido horizontal de soluciones"
    >
      <div ref={trackRef} className="horizontal-track">
        {panels.map((p, i) => {
          const PanelComp = p.component;
          return (
            <section
              key={p.title}
              id={`hx-panel-${i}`}
              ref={(el) => {
                if (el) slideRefs.current[i] = el;
              }}
              className="horizontal-slide"
              role="group"
              aria-label={p.title}
              style={{
                background: slideBackgrounds[i] ?? "#0f0f10"
              }}
            >
              <div className="slide-content">
                {PanelComp ? (
                  <PanelComp />
                ) : (
                  <div className="content">
                    <h2>{p.title}</h2>
                    {!!p.items?.length && (
                      <ul>{p.items.map((t) => <li key={t}>{t}</li>)}</ul>
                    )}
                    <a href={p.ctaHref} className="btn">Ingresar</a>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Navigation dots with transition indicator */}
      <ul className="scroll-dots" aria-label="Progreso" role="tablist">
        {panels.map((panel, i) => (
          <li key={i}>
            <button
              type="button"
              role="tab"
              aria-label={`Ir al slide ${i + 1}: ${panel.title}`}
              aria-selected={i === activeIndex}
              aria-controls={`hx-panel-${i}`}
              className={`dot ${i === activeIndex ? "active" : ""}`}
              onClick={() => goToSlide(i)}
              title={`Ir a ${panel.title}`}
            />
            {i < panels.length - 1 && (
              <span className={`transition-bridge ${i === activeIndex || i === activeIndex - 1 ? 'active' : ''}`} />
            )}
          </li>
        ))}
      </ul>

      {/* Transition arrows */}
      {activeIndex < panels.length - 1 && (
        <div className="next-indicator">
          <span>→</span>
          <p>{panels[activeIndex + 1]?.title}</p>
        </div>
      )}
      {activeIndex > 0 && (
        <div className="prev-indicator">
          <span>←</span>
          <p>{panels[activeIndex - 1]?.title}</p>
        </div>
      )}

      <style jsx>{`
        .horizontal-scroll-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 10;
          background: #000;
        }

        .horizontal-track {
          display: flex;
          height: 100vh;
          width: ${panels.length * 100}vw;
          will-change: transform;
        }

        .horizontal-slide {
          flex: 0 0 100vw;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
          transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
          will-change: opacity, transform, filter;
        }

        .horizontal-slide::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg,
            rgba(0,0,0,0.3) 0%,
            transparent 10%,
            transparent 90%,
            rgba(0,0,0,0.3) 100%
          );
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .horizontal-slide:not(:first-child)::before,
        .horizontal-slide:not(:last-child)::before {
          opacity: 0.5;
        }

        .slide-content {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .slide-content::-webkit-scrollbar {
          width: 6px;
        }

        .slide-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        .slide-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .slide-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .slide-content > * {
          width: 100%;
          min-height: 100%;
          flex-shrink: 0;
        }

        .scroll-dots {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 100;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .scroll-dots li {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot:hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }

        .dot.active {
          background: white;
          transform: scale(1.2);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
        }

        .transition-bridge {
          width: 24px;
          height: 2px;
          background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.5),
            rgba(255, 255, 255, 0.2)
          );
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .transition-bridge::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
          );
          animation: bridge-flow 2s ease-in-out infinite;
        }

        .transition-bridge.active {
          background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.5),
            rgba(255, 255, 255, 1),
            rgba(255, 255, 255, 0.5)
          );
        }

        @keyframes bridge-flow {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .next-indicator,
        .prev-indicator {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          color: white;
          z-index: 90;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .next-indicator {
          right: 2rem;
        }

        .prev-indicator {
          left: 2rem;
          flex-direction: row-reverse;
        }

        .next-indicator:hover,
        .prev-indicator:hover {
          opacity: 1;
        }

        .next-indicator span,
        .prev-indicator span {
          font-size: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .next-indicator p,
        .prev-indicator p {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @media (max-width: 1024px) {
          .horizontal-track {
            flex-direction: column;
            width: 100vw;
            height: auto;
          }

          .horizontal-slide {
            flex: 0 0 auto;
            width: 100vw;
            min-height: 100vh;
            height: auto;
          }

          .scroll-dots {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
