# Kredian

Verifica certificaciones tech de Credly y deja un **sello en blockchain** que cualquier reclutador puede comprobar.

La fuente de verdad del proyecto es [`PROYECTO.md`](./PROYECTO.md). Leelo antes de escribir código.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (login y base de datos)
- Sepolia + ethers.js v6 (sello)

## Cómo correrlo en local

```bash
git clone https://github.com/Danny-Carvajal/kredian.git C:\Users\Danny\code\kredian
cd C:\Users\Danny\code\kredian
npm install
copy .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Las llaves van en `.env.local` (nunca al repo). Copiá `.env.example` y completá los valores cuando el equipo las tenga.

## Ramas

Nadie trabaja en `main`. Cada persona usa su rama (`jose/...`, `juliana/...`, `daniel/...`, `danny/...`). Solo Danny junta ramas en `main` con Pull Request.
