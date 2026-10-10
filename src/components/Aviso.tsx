import type { ReactNode } from "react";

const TONOS = {
  error: "border-red-200 bg-red-50 text-red-900",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-950",
  aviso: "border-seal/50 bg-seal/10 text-ink",
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
