import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <p className="text-sm font-medium tracking-wide uppercase text-zinc-500">
          Verificador de certificaciones
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Kredian
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Verificamos las certificaciones tech que ya tenés (Credly) y dejamos
          un sello en blockchain que cualquier reclutador puede comprobar sin
          confiar en nosotros.
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
      </main>
    </div>
  );
}
