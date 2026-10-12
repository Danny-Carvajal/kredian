"use client";

import { useEffect, useRef } from "react";
import { Hoja } from "@/components/Marca";

export function FondoParallax() {
  const capaLenta = useRef<HTMLDivElement>(null);
  const capaRapida = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const mobile = window.innerWidth < 768;
        const lenta = y * (mobile ? 0.08 : 0.18);
        const rapida = y * (mobile ? 0.14 : 0.32);
        if (capaLenta.current) {
          capaLenta.current.style.transform = `translate3d(0, ${-lenta}px, 0)`;
        }
        if (capaRapida.current) {
          capaRapida.current.style.transform = `translate3d(0, ${-rapida}px, 0)`;
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        ref={capaLenta}
        className="absolute -left-16 top-10 text-seal/25 will-change-transform sm:-left-6"
      >
        <Hoja className="h-48 w-48 sm:h-72 sm:w-72" />
      </div>
      <div
        ref={capaRapida}
        className="absolute -right-10 top-52 text-seal/20 will-change-transform sm:right-4 sm:top-24"
      >
        <Hoja className="h-36 w-36 rotate-[200deg] sm:h-56 sm:w-56" />
      </div>
      <div className="absolute bottom-10 left-1/3 text-wax/15">
        <Hoja className="h-28 w-28 rotate-12 sm:h-40 sm:w-40" />
      </div>
    </div>
  );
}
