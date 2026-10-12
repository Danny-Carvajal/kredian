import type { ReactNode } from "react";

const TONOS = {
  error: "border-red-900/70 bg-red-950/50 text-red-100",
  ok: "border-seal/40 bg-seal/10 text-ink",
  aviso: "border-line bg-surface text-foreground",
} as const;

export function Aviso({
  tono,
  children,
}: {
  tono: keyof typeof TONOS;
  children: ReactNode;
}) {
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${TONOS[tono]}`}
    >
      {children}
    </div>
  );
}
