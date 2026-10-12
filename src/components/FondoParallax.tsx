"use client";

import { useEffect, useRef } from "react";
import { Hoja } from "@/components/Marca";

export function FondoParallax() {
  const capa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const subir = window.scrollY * 0.22;
        if (capa.current) {
          capa.current.style.transform = `translate3d(0, ${-subir}px, 0)`;
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
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div ref={capa} className="absolute inset-0 will-change-transform">
        <Hoja className="absolute -left-10 top-24 h-56 w-56 text-seal/20 sm:h-80 sm:w-80" />
        <Hoja className="absolute -right-8 top-40 h-44 w-44 rotate-[210deg] text-seal/15 sm:h-64 sm:w-64" />
        <Hoja className="absolute bottom-[20%] left-[40%] h-32 w-32 rotate-12 text-wax/10 sm:h-48 sm:w-48" />
      </div>
    </div>
  );
}
