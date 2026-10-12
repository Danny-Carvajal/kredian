import Link from "next/link";

export default function PerfilNoEncontrado() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="font-display text-4xl text-ink">No encontramos ese perfil</h1>
      <p className="text-muted">
        Revisá el usuario de la URL. El perfil público es /u/nombre-de-usuario.
      </p>
      <Link href="/" className="font-medium text-ink underline underline-offset-4">
        Volver al inicio
      </Link>
    </div>
  );
}
