import Link from "next/link";

export default function PerfilNoEncontrado() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">No encontramos ese perfil</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Revisá el usuario de la URL. El perfil público es /u/nombre-de-usuario.
      </p>
      <Link href="/" className="underline">
        Volver al inicio
      </Link>
    </div>
  );
}
