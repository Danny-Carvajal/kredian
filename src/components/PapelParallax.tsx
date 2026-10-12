"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function PapelParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!el || reduce) return;

    let frame = 0;

    const aplicar = () => {
      frame = 0;
      if (window.innerWidth < 768) {
        const y = window.scrollY * 0.06;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
        return;
      }
      const y = window.scrollY * 0.12;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(aplicar);
    };

    aplicar();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="relative will-change-transform">
      {children}
    </div>
  );
}
