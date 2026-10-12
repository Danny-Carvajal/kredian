import Link from "next/link";
import { Hoja } from "@/components/Marca";
import { InsigniaRango, RANGOS } from "@/components/InsigniaRango";
import { PerfilPublico } from "@/components/PerfilPublico";

const PASOS = [
  "El usuario pega el link público de su insignia de Credly.",
  "Kredian lee los datos de la insignia (nombre, emisor, fecha, estado).",
  "Kredian compara el nombre de la insignia con el nombre del perfil.",
  "Si todo cuadra, Kredian guarda un sello (hash) en la blockchain de pruebas Sepolia.",
  "El perfil público muestra la insignia con su rango (Bronce a Platino) y el botón «Comprobar sello».",
];

const VIAJE = [
  {
    titulo: "Planta",
    texto: "La certificación ya vive afuera, en Credly. Nosotros no la emitimos: la leemos como algo que creció en otro lado.",
  },
  {
    titulo: "Papel",
    texto: "Esa insignia se vuelve un documento en tu perfil: nombre, emisor, fecha y estado, listos para un reclutador.",
  },
  {
    titulo: "Sello",
    texto: "Si el nombre cuadra, el hash queda lacrado en Sepolia. El papel se puede copiar; el sello, no.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-16">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-seal/35 bg-seal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-seal">
            <Hoja className="h-3.5 w-3.5 text-seal" />
            De la planta al sello
          </p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] text-ink sm:text-7xl">
            Un sello que el CV
            <span className="block text-seal">no puede mentir.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/90">
            Kredian verifica las certificaciones tech que ya tenés (Credly) y
            deja un sello en blockchain que cualquier reclutador puede comprobar
            sin confiar en nosotros.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            No somos emisores. Somos verificadores. No competimos con Credly, lo
            usamos como fuente.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-seal px-8 text-base font-semibold text-[#06210f] transition hover:brightness-110"
            >
              Entrar
            </Link>
            <a
              href="#credencial"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-ink hover:border-seal/50"
            >
              Ver el papel
            </a>
          </div>
        </div>

        <div id="credencial" className="relative">
          <div
            className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-seal/12 blur-3xl"
            aria-hidden
          />
          <PerfilPublico
            ejemplo
            nombre="Tu nombre"
            usuario="tu-usuario"
            credenciales={[
              {
                titulo: "AWS Educate Introduction to Cloud 101",
                emisor: "Amazon Web Services",
                fecha: "2026-03-12",
                estado: "vigente",
                rango: "oro",
                estadoSello: "pendiente",
                ejemplo: true,
                etherscanUrl: "https://sepolia.etherscan.io",
              },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="viaje-titulo">
        <h2 id="viaje-titulo" className="font-display text-3xl text-ink">
          Planta, papel, sello
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
          Así se lee Kredian: de algo vivo, a un documento, a un lacre que ya no depende de nosotros.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {VIAJE.map((paso, indice) => (
            <li
              key={paso.titulo}
              className="rounded-[1.5rem] border border-line bg-surface/80 p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-seal">
                {String(indice + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-3 text-2xl text-ink">{paso.titulo}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2" aria-labelledby="problema-titulo">
        <div className="rounded-[1.75rem] border border-line bg-surface/80 p-7">
          <h2 id="problema-titulo" className="font-display text-3xl text-ink">
            El problema
          </h2>
          <ul className="mt-5 flex flex-col gap-3 text-base leading-7 text-foreground/90">
            <li>Cualquiera puede escribir «AWS Certified» en su CV o LinkedIn.</li>
            <li>Revisar cada certificado a mano le toma tiempo al reclutador.</li>
            <li>Las certificaciones vencen o se revocan y nadie se entera.</li>
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-line bg-surface/80 p-7">
          <h2 className="font-display text-3xl text-ink">Nuestra solución</h2>
          <ol className="mt-5 flex flex-col gap-4">
            {PASOS.map((paso, indice) => (
              <li key={paso} className="flex gap-3 text-base leading-7">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-seal text-xs font-bold text-[#06210f]">
                  {indice + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="overflow-hidden rounded-[2rem] border border-seal/25 bg-gradient-to-br from-seal/15 via-surface to-background px-7 py-10 sm:px-12"
        aria-labelledby="blockchain-titulo"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-wax">
          El lacre
        </p>
        <h2 id="blockchain-titulo" className="font-display mt-3 text-3xl text-ink sm:text-4xl">
          Por qué blockchain
        </h2>
        <ul className="mt-6 grid gap-4 text-base leading-7 text-foreground/90 sm:grid-cols-2">
          <li>El sello es un testigo neutral: prueba que en tal fecha esa insignia existía y estaba vigente.</li>
          <li>Ni nosotros podemos alterarlo ni borrarlo, aunque cambiemos nuestra base de datos.</li>
          <li>El reclutador puede comprobar el sello en Etherscan sin confiar en Kredian.</li>
          <li>En blockchain solo va un hash, nunca datos personales.</li>
        </ul>
      </section>

      <section id="rangos" aria-labelledby="rangos-titulo">
        <h2 id="rangos-titulo" className="font-display text-3xl text-ink">
          Rangos
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
          Bronce, Plata, Oro y Platino. El perfil público muestra la insignia con su rango.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RANGOS.map((rango) => (
            <li
              key={rango}
              className="flex items-center justify-center rounded-[1.5rem] border border-line bg-surface/80 px-3 py-8"
            >
              <InsigniaRango rango={rango} tamano="lg" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="honestidad-titulo" className="border-t border-line pt-10">
        <h2 id="honestidad-titulo" className="text-sm font-semibold uppercase tracking-[0.18em] text-seal">
          Con honestidad
        </h2>
        <ul className="mt-4 flex max-w-3xl flex-col gap-2 text-sm leading-6 text-muted">
          <li>Comparar nombres no prueba al 100% que la insignia sea tuya. Mejora futura: verificar correo.</li>
          <li>Leemos la página pública de Credly; no es una API oficial para terceros. Para producción haría falta un acuerdo.</li>
          <li>Usamos Sepolia (red de pruebas), no dinero real.</li>
        </ul>
      </section>
    </div>
  );
}
