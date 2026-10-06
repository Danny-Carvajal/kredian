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

Si ya clonaste el repo:

```bash
cd /c/Users/Danny/code/kredian
git fetch origin
git checkout cursor/nextjs-scaffold-42fc
npm install
cp .env.example .env.local
npm run dev
```

Si todavía no lo clonaste:

```bash
mkdir -p /c/Users/Danny/code
git clone https://github.com/Danny-Carvajal/kredian.git /c/Users/Danny/code/kredian
cd /c/Users/Danny/code/kredian
git checkout cursor/nextjs-scaffold-42fc
npm install
cp .env.example .env.local
npm run dev
```

El resto del equipo clona en su propia carpeta (el último argumento de `git clone` es la ruta destino).

Abrí [http://localhost:3000](http://localhost:3000).

Las llaves van en `.env.local` (nunca al repo). Copiá `.env.example` y completá los valores cuando el equipo las tenga.

## Ramas

Nadie trabaja en `main`. Cada persona usa su rama (`jose/...`, `juliana/...`, `daniel/...`, `danny/...`). Solo Danny junta ramas en `main` con Pull Request.
