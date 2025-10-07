"use client";
import { useEffect, useState } from "react";

type Props = {
  videos: string[];
  title: string;
  subtitle: string;
};

export default function HeroVertical({ videos, title, subtitle }: Props) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handle = () => setReducedMotion(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", handle);
    else mq.addListener(handle);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handle);
      else mq.removeListener(handle);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % videos.length), 8000);
    return () => clearInterval(id);
  }, [videos.length, reducedMotion]);

  return (
    <section className="hero-vertical" role="banner">
      <div className="video-background" aria-hidden="true">
        {videos.map((src, i) => (
          <video
            key={src}
            className={`hero-video ${i === index ? "active" : ""}`}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}
      </div>

      <div className="overlay">
        <div className="hero-content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

        <style>{`
          .hero-vertical {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .video-background {
            position: absolute;
            inset: 0;
            z-index: 1;
          }
          /* avoid videos capturing pointer events */
          .video-background .hero-video { pointer-events: none; }
          .hero-video {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
          }
          .hero-video.active { opacity: 0.8; }
          .overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
            padding: 4rem 2rem 2rem;
            z-index: 2;
          }
          .hero-content {
            max-width: 1200px;
            margin-top: clamp(3.5rem, 12vh, 6rem);
            margin-bottom: 2.5rem;
            width: 100%;
          }
          h1 {
            color: #fff;
            font-size: clamp(3rem, 6.5vw, 5rem);
            font-weight: 700;
            margin-bottom: 1.75rem;
            line-height: 1.15;
            text-shadow: 0 6px 18px rgba(0,0,0,0.35);
          }
          p {
            color: #e5e7eb;
            font-size: clamp(1.2rem, 2.4vw, 1.6rem);
            max-width: 720px;
            line-height: 1.55;
            margin: 0 auto 2.75rem auto;
          }

          /* Mobile Responsive Design */
          @media (max-width: 768px) {
            .hero-vertical {
              min-height: 100vh;
            }
            .overlay {
              padding: 1.5rem 1rem;
              justify-content: center;
            }
            .hero-content {
              margin-bottom: 2rem;
              max-width: 100%;
            }
            h1 {
              font-size: clamp(2.4rem, 8vw, 3.4rem);
              margin-bottom: 1.1rem;
              line-height: 1.1;
            }
            p {
              font-size: clamp(1rem, 4.5vw, 1.2rem);
              margin-bottom: 1.6rem;
              max-width: 100%;
              padding: 0 0.5rem;
            }
            .cta-buttons {
              flex-direction: column;
              align-items: center;
              gap: 1rem;
            }
            .btn-primary, .btn-secondary {
              width: 100%;
              max-width: 280px;
              padding: 1rem 1.5rem;
              font-size: 1rem;
            }
          }

          /* Tablet Responsive Design */
          @media (min-width: 769px) and (max-width: 1024px) {
            .overlay {
              padding: 2rem 1.5rem;
            }
            .hero-content {
              max-width: 700px;
              margin-bottom: 3rem;
            }
            h1 {
              font-size: clamp(2.8rem, 5vw, 3.8rem);
              margin-bottom: 1.35rem;
            }
            p {
              font-size: clamp(1.1rem, 2.6vw, 1.35rem);
              max-width: 600px;
              margin-bottom: 2.2rem;
            }
          }

          /* Large Screen Optimization */
          @media (min-width: 1440px) {
            .overlay {
              padding: 3rem 2rem;
            }
            .hero-content {
              max-width: 900px;
              margin-bottom: 5rem;
            }
            h1 {
              font-size: clamp(3.4rem, 4.2vw, 4.8rem);
            }
            p {
              font-size: clamp(1.2rem, 1.6vw, 1.5rem);
              max-width: 760px;
            }
          }

          /* Ultra-wide screens */
          @media (min-width: 1920px) {
            .hero-content {
              max-width: 1000px;
            }
          }

          /* Portrait orientation on tablets */
          @media (orientation: portrait) and (min-width: 768px) and (max-width: 1024px) {
            .overlay {
              padding: 2rem;
            }
            .hero-content {
              margin-bottom: 3rem;
            }
          }

          /* Landscape orientation on mobile */
          @media (orientation: landscape) and (max-height: 600px) {
            .overlay {
              padding: 1rem;
              justify-content: center;
            }
            .hero-content {
              margin-bottom: 1rem;
            }
            h1 {
              font-size: clamp(2rem, 6.5vw, 2.8rem);
              margin-bottom: 0.6rem;
            }
            p {
              font-size: clamp(0.95rem, 3.2vw, 1.1rem);
              margin-bottom: 1.1rem;
            }
          }

          /* Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            .hero-video {
              transition: none;
            }
          }

          /* High Contrast Mode Support */
          @media (prefers-contrast: high) {
            h1 {
              text-shadow: 0 2px 8px rgba(0,0,0,0.8);
            }
            .overlay {
              background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%);
            }
          }

          /* Performance optimization for smaller screens */
          @media (max-width: 480px) {
            .hero-video {
              object-fit: cover;
              object-position: center;
            }
          }
        `}</style>
    </section>
  );
}
