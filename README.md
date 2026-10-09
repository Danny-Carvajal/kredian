# Kredian

Verifica certificaciones tech de Credly y deja un **sello en blockchain** que cualquier reclutador puede comprobar.

La fuente de verdad del proyecto es [`PROYECTO.md`](./PROYECTO.md). Leelo antes de escribir código.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (login y base de datos)
- Sepolia + ethers.js v6 (sello)

## Cómo correrlo en local (Git Bash)

En Git Bash usá `/` en las rutas, no `\`. Corré **un comando por línea**.

```bash
cd /c/Users/Danny/code/kredian
git fetch origin
git checkout cursor/login-supabase-42fc
npm install
cp .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Supabase (login de hoy)

1. [supabase.com](https://supabase.com) → New project `kredian`.
2. Settings → API: copiá Project URL y `anon` `public` a `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Authentication → Providers → Email: para el MVP, desactivá **Confirm email**.
4. Authentication → URL configuration: Site URL `http://localhost:3000`.
5. SQL Editor: abrí `supabase/schema.sql`, pegá todo, Run.
6. Reiniciá `npm run dev` y creá una cuenta en `/login`.

Las llaves nunca van al repo.
