import Link from "next/link";
import { InsigniaRango, RANGOS } from "@/components/InsigniaRango";
import { PerfilPublico } from "@/components/PerfilPublico";

const PASOS = [
  "El usuario pega el link público de su insignia de Credly.",
  "Kredian lee los datos de la insignia (nombre, emisor, fecha, estado).",
  "Kredian compara el nombre de la insignia con el nombre del perfil.",
  "Si todo cuadra, Kredian guarda un sello (hash) en la blockchain de pruebas Sepolia.",
  "El perfil público muestra la insignia con su rango (Bronce a Platino) y el botón «Comprobar sello».",
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-14">
      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink">
            <span className="inline-block h-2 w-2 rounded-full bg-seal" aria-hidden />
            Verificador de certificaciones
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
            Kredian
          </h1>
          <p className="mt-5 text-lg leading-8">
            Kredian verifica las certificaciones tech que ya tenés (Credly) y
            deja un sello en blockchain que cualquier reclutador puede comprobar
            sin confiar en nosotros.
          </p>
          <p className="mt-4 text-base leading-7 text-muted">
            No somos emisores. Somos verificadores. No competimos con Credly, lo
            usamos como fuente.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Entrar
          </Link>
        </div>

        <div id="credencial">
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

      <section className="grid gap-10 md:grid-cols-2" aria-labelledby="problema-titulo">
        <div>
          <h2 id="problema-titulo" className="text-2xl font-semibold tracking-tight text-ink">
            El problema
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-base leading-7">
            <li>Cualquiera puede escribir «AWS Certified» en su CV o LinkedIn.</li>
            <li>Revisar cada certificado a mano le toma tiempo al reclutador.</li>
            <li>Las certificaciones vencen o se revocan y nadie se entera.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Nuestra solución</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {PASOS.map((paso, indice) => (
              <li key={paso} className="flex gap-3 text-base leading-7">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                  {indice + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-3xl bg-ink px-6 py-8 text-white sm:px-10" aria-labelledby="blockchain-titulo">
        <h2 id="blockchain-titulo" className="text-2xl font-semibold tracking-tight">
          Por qué blockchain
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-base leading-7 text-white/90">
          <li>El sello es un testigo neutral: prueba que en tal fecha esa insignia existía y estaba vigente.</li>
          <li>Ni nosotros podemos alterarlo ni borrarlo, aunque cambiemos nuestra base de datos.</li>
          <li>El reclutador puede comprobar el sello en Etherscan sin confiar en Kredian.</li>
          <li>En blockchain solo va un hash, nunca datos personales.</li>
        </ul>
      </section>

      <section id="rangos" aria-labelledby="rangos-titulo">
        <h2 id="rangos-titulo" className="text-2xl font-semibold tracking-tight text-ink">
          Rangos
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
          Bronce, Plata, Oro y Platino. El perfil público muestra la insignia con su rango.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RANGOS.map((rango) => (
            <li
              key={rango}
              className="flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-6"
            >
              <InsigniaRango rango={rango} tamano="lg" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="honestidad-titulo" className="border-t border-line pt-8">
        <h2 id="honestidad-titulo" className="text-lg font-semibold text-ink">
          Con honestidad
        </h2>
        <ul className="mt-3 flex max-w-3xl flex-col gap-2 text-sm leading-6 text-muted">
          <li>Comparar nombres no prueba al 100% que la insignia sea tuya. Mejora futura: verificar correo.</li>
          <li>Leemos la página pública de Credly; no es una API oficial para terceros. Para producción haría falta un acuerdo.</li>
          <li>Usamos Sepolia (red de pruebas), no dinero real.</li>
        </ul>
      </section>
    </div>
  );
}
