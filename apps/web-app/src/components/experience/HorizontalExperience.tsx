"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getAppUrl } from "@/lib/env";
import ProfessionalPatientsFeatures from "@/components/landing/ProfessionalPatientsFeatures";
import ProfessionalDoctorsFeatures from "@/components/landing/ProfessionalDoctorsFeatures";
import ProfessionalCompaniesFeatures from "@/components/landing/ProfessionalCompaniesFeatures";

type Panel = {
  title: string;
  items?: string[];
  ctaHref: string;
  component?: React.ComponentType;
};

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalExperience({ onLeaveTo = "/model-viewer" }: { onLeaveTo?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);

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
  ];

  const slideBackgrounds = [
    "linear-gradient(135deg, #101010, #181818)",
    "linear-gradient(135deg, #f2f2f2, #d8d8d8)",
    "linear-gradient(135deg, #111111, #1a1a1a)",
  ];

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    track.style.width = `${panels.length * 100}vw`;

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);

    mm.add(
      {
        isDesktop: "(min-width: 769px)",
        okMotion: "(prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { isDesktop, okMotion } = ctx.conditions as { isDesktop: boolean; okMotion: boolean };
        if (!isDesktop || !okMotion) return;

        const sections = gsap.utils.toArray<HTMLElement>(".hx-slide");
        const totalShift = -100 * (sections.length - 1);

        const st = gsap.to(track, {
          xPercent: totalShift,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${window.innerWidth * (sections.length - 1)}`,
            pin: true,
            scrub: 1,
            pinSpacing: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (sections.length - 1));
              if (idx !== section) setSection(idx);
            },
          },
        });

        return () => {
          st.scrollTrigger?.kill();
          st.kill();
        };
      }
    );

    return () => {
      mm.kill();
      ro.disconnect();
    };
  }, [panels.length]);

  useLayoutEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = Math.max(0, Math.min(panels.length - 1, section + dir));
      const target = document.getElementById(`hx-panel-${next}`);
      target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section, panels.length]);

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
        style={{ ['--hx-pad' as any]: "0px" }}
      >
        {panels.map((p, i) => {
          const PanelComp = p.component;
          return (
            <section
              key={p.title}
              id={`hx-panel-${i}`}
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

      <div className="dots" aria-label="Progreso" role="tablist">
        {panels.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === section}
            aria-controls={`hx-panel-${i}`}
            className={`dot ${i === section ? "active" : ""}`}
            onClick={() =>
              document.getElementById(`hx-panel-${i}`)?.scrollIntoView({ behavior: "smooth", inline: "start" })
            }
            title={`Ir a ${panels[i]?.title ?? 'Panel'}`}
          />
        ))}
      </div>

      <style>{`
        .hx-container{
          position:relative;
          min-height:100vh;
          overflow:hidden;
          background: transparent;
          color: var(--au-text-primary);
        }
        .hx-track{
          display:flex;
          overflow-x:auto;
          overflow-y:clip;
          overscroll-behavior-x:contain;
          scroll-snap-type:x mandatory;
          gap:0;
          min-height:100vh;
          height:100%;
          padding-inline:var(--hx-pad, 0px);
          background:transparent;
          will-change:transform;
          scrollbar-width:none;
          -ms-overflow-style:none;
        }
        .hx-track::-webkit-scrollbar{ display:none; }
        .hx-slide{
          flex:0 0 calc(100vw - (var(--hx-pad, 0px) * 2));
          min-height:100vh;
          scroll-snap-align:start;
          background:var(--slide-bg, #0f0f10);
          border-radius:16px;
          overflow:hidden;
          position:relative;
          display:flex;
          margin:0;
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
        }
        .dot{
          width:12px;
          height:12px;
          border-radius:50%;
          background:rgba(255,255,255,0.25);
          border:1px solid rgba(255,255,255,0.4);
          cursor:pointer;
          transition:transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .dot.active{
          background:var(--au-accent);
          border-color:var(--au-accent);
          transform:scale(1.15);
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

        @media (prefers-reduced-motion: reduce){
          .dot{ transition:none; }
        }
      `}</style>
    </div>
  );
}
