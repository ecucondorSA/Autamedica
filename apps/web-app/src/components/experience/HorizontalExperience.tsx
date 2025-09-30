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

export default function HorizontalExperience({ onLeaveTo = "/model-viewer" }: { onLeaveTo?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

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

    // Initialize slideRefs array
    slideRefs.current = [];

    // Log diagnóstico mejorado
    console.log('[HX] Carousel Init:', {
      slides: panels.length,
      w: window.innerWidth,
      h: window.innerHeight,
      mqDesktop: window.matchMedia('(min-width:1025px)').matches,
      mqLandscape: window.matchMedia('(orientation: landscape)').matches,
      reducedMotion: reduced
    });

    mm.add(
      {
        desktop: "(min-width:1025px)",
        reduced: "(prefers-reduced-motion: reduce)"
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };

        if (reduced) {
          console.log('[HX] Reduced motion detected, skipping animations');
          return;
        }

        if (!desktop) {
          console.log('[HX] Mobile/tablet detected, using vertical layout');
          ScrollTrigger.getAll().forEach(t => t.kill());
          return;
        }

        const container = containerRef.current!;
        const track = trackRef.current!;
        const slides = slideRefs.current;
        const total = panels.length;

        // Setup container for full viewport
        gsap.set(container, {
          width: "100vw !important",
          height: "100vh !important",
          minHeight: "100vh !important",
          maxHeight: "100vh !important",
          overflow: "hidden"
        });

        // Setup track and slides - exact sizing
        gsap.set(track, {
          width: `${total * 100}vw`,
          height: "100vh",
          minHeight: "100vh",
          maxHeight: "100vh",
          display: "flex",
          padding: "0 !important",
          margin: "0 !important",
          gap: 0,
          overflow: "visible"
        });
        slides.forEach(slide => {
          if (slide) gsap.set(slide, {
            flex: "0 0 100vw",
            width: "100vw",
            height: "100vh",
            minHeight: "100vh",
            maxHeight: "100vh",
            borderRadius: 0,
            margin: 0,
            padding: 0
          });
        });

        const anim = gsap.to(track, {
          xPercent: -100 * (total - 1),
          ease: "none",
        });

        const st = ScrollTrigger.create({
          id: "horizontal-experience",
          trigger: container,
          start: "top top",
          end: () => `+=${(total - 1) * window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          scrub: true,
          animation: anim,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // progress → índice
            const i = Math.round(self.progress * (total - 1));
            if (i !== activeIndexRef.current) {
              console.log('[HX] Section changed:', activeIndexRef.current, '→', i);
              activeIndexRef.current = i;
              setActiveIndex(i);
            }
          },
          onRefresh: () => {
            console.log('[HX] ScrollTrigger refreshed');
          }
        });

        ctx.add(() => {
          ScrollTrigger.refresh();
        });

        return () => {
          console.log('[HX] Cleaning up GSAP animations');
          anim.kill();
          st.kill();
        };
      }
    );

    return () => {
      console.log('[HX] Component cleanup');
      mm.revert();
    };
  }, [panels.length]);

  const goToSlide = (targetIndex: number) => {
    const total = panels.length;
    const clamped = Math.max(0, Math.min(targetIndex, total - 1));

    console.log('[HX Nav] Going to slide:', clamped, 'from:', activeIndexRef.current);

    // Distance in px (matches ScrollTrigger end calc)
    const distance = clamped * window.innerHeight;

    const st = ScrollTrigger.getById("horizontal-experience");
    if (st) {
      // Target scroll position
      const targetY = st.start + distance;

      console.log('[HX Nav] GSAP scroll:', {
        distance,
        targetY,
        start: st.start,
        end: st.end
      });

      // Use ScrollToPlugin to move the scroll associated with pinned ScrollTrigger
      gsap.to(window, {
        duration: 0.6,
        scrollTo: { y: targetY, autoKill: false },
        ease: "power2.out",
        onUpdate: () => ScrollTrigger.update(),
        onComplete: () => {
          console.log('[HX Nav] Navigation complete to slide', clamped);
        }
      });
    } else {
      console.log('[HX Nav] No ScrollTrigger, using fallback');
      // Fallback for mobile/tablet scenarios
      const target = document.getElementById(`hx-panel-${clamped}`);
      target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
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
      className="hx-container"
      role="region"
      aria-label="Recorrido horizontal de soluciones"
    >
      <div
        ref={trackRef}
        className="hx-track"
      >
        {panels.map((p, i) => {
          const PanelComp = p.component;
          return (
            <section
              key={p.title}
              id={`hx-panel-${i}`}
              ref={(el) => {
                if (el) slideRefs.current[i] = el;
              }}
              className="hx-slide"
              role="group"
              aria-label={p.title}
              style={{ ['--slide-bg' as any]: slideBackgrounds[i] ?? "#0f0f10" }}
            >
              <div className="hx-slide-inner">
                {PanelComp ? (
                  <PanelComp />
                ) : (
                  <div className="content">
                    <h2>{p.title}</h2>
                    {!!p.items?.length && (
                      <ul>{p.items.map((t) => <li key={t}>{t}</li>)}</ul>
                    )}
                    <a href={p.ctaHref} className="btn">Ingresar</a>
                    <div style={{ marginTop: "1rem" }}>
                      <a href={onLeaveTo} className="btn" aria-label="Ver asistente 3D">Ver asistente 3D</a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <ul className="dots" aria-label="Progreso" role="tablist">
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
          </li>
        ))}
      </ul>

      <style>{`
        .hx-container{
          position:relative !important;
          width:100vw !important;
          height:100vh !important;
          min-height:100vh !important;
          max-height:100vh !important;
          overflow:hidden !important;
          background: transparent;
          color: var(--au-text-primary);
        }
        .hx-track{
          display:flex !important;
          height:100vh !important;
          min-height:100vh !important;
          max-height:100vh !important;
          overflow:visible !important;
          gap:0 !important;
          padding:0 !important;
          margin:0 !important;
          background:transparent;
          will-change:transform;
          scrollbar-width:none;
          -ms-overflow-style:none;
        }
        .hx-track::-webkit-scrollbar{ display:none; }
        .hx-slide{
          flex:0 0 100vw !important;
          width:100vw !important;
          height:100vh !important;
          min-height:100vh !important;
          max-height:100vh !important;
          background:var(--slide-bg, #0f0f10);
          border-radius:0 !important;
          overflow:hidden;
          position:relative;
          display:flex;
          margin:0 !important;
          padding:0 !important;
        }
        .hx-slide-inner{
          flex:1 1 auto;
          min-height:100%;
          width:100%;
          display:flex;
          overflow-y:auto;
          overflow-x:hidden;
          padding:0;
          scrollbar-width:thin;
        }
        .hx-slide-inner::-webkit-scrollbar{ width:6px; }
        .hx-slide-inner::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.12); border-radius:3px; }
        .hx-slide-inner > *{
          flex:1 1 auto;
          min-height:100%;
          width:100%;
        }
        .dots{
          position:fixed;
          bottom:1.25rem;
          left:50%;
          transform:translateX(-50%);
          display:flex;
          gap:0.65rem;
          z-index:10;
          list-style:none;
          margin:0;
          padding:0;
        }
        .dots li{
          margin:0;
          padding:0;
        }
        .dot{
          width:12px;
          height:12px;
          border-radius:50%;
          background:rgba(255,255,255,0.25);
          border:1px solid rgba(255,255,255,0.4);
          cursor:pointer;
          transition:transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          position:relative;
        }
        .dot:hover{
          background:rgba(255,255,255,0.4);
          border-color:rgba(255,255,255,0.6);
          transform:scale(1.1);
        }
        .dot.active{
          background:var(--au-accent, #ffffff);
          border-color:var(--au-accent, #ffffff);
          transform:scale(1.15);
          box-shadow:0 0 10px rgba(255,255,255,0.3);
        }
        .dot:focus{
          outline:2px solid rgba(255,255,255,0.5);
          outline-offset:2px;
        }

        @media (max-width:768px){
          .hx-track{
            padding-inline:0;
          }
          .dots{
            bottom:1rem;
            gap:0.5rem;
          }
          .dot{
            width:10px;
            height:10px;
          }
        }

        /* Fix VideoGrid sizing when inside carousel */
        .hx-slide-inner .video-grid-section{
          min-height:100vh !important;
          max-height:100vh !important;
          height:100vh !important;
          padding:2rem !important;
          overflow:hidden !important;
        }

        @media (prefers-reduced-motion: reduce){
          .dot{ transition:none; }
        }
      `}</style>
    </div>
  );
}
