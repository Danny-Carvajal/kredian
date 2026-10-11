function Barra({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded-full bg-line ${className}`} />;
}

export function EstadoCarga({
  variante,
}: {
  variante: "inicio" | "login" | "perfil" | "publico";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16"
    >
      <p className="text-sm font-medium text-ink">Cargando…</p>
      {variante === "login" ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6">
          <Barra className="h-8 w-32" />
          <Barra className="h-4 w-56" />
          <Barra className="mt-4 h-11 w-full" />
          <Barra className="h-11 w-full" />
          <Barra className="h-12 w-full" />
        </div>
      ) : null}
      {variante === "perfil" || variante === "publico" ? (
        <div className="flex flex-col gap-3">
          <Barra className="h-8 w-40" />
          <Barra className="h-4 w-64" />
          <Barra className="mt-2 h-11 w-full" />
          <Barra className="h-11 w-full" />
          <Barra className="h-24 w-full" />
          <Barra className="h-36 w-full rounded-2xl" />
        </div>
      ) : null}
      {variante === "inicio" ? (
        <div className="flex flex-col gap-3">
          <Barra className="h-4 w-40" />
          <Barra className="h-12 w-48" />
          <Barra className="h-4 w-full" />
          <Barra className="h-4 w-5/6" />
          <Barra className="mt-2 h-12 w-32" />
        </div>
      ) : null}
    </div>
  );
}
