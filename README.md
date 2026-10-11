# Kredian

Verifica certificaciones tech de Credly y deja un **sello en blockchain** que cualquier reclutador puede comprobar.

La fuente de verdad del proyecto es [`PROYECTO.md`](./PROYECTO.md). Leelo antes de escribir código.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (login y base de datos)
- Sepolia + ethers.js v6 (sello)

## Cómo correrlo (Git Bash)

En Git Bash usá `/` en las rutas, no `\`. Un comando por línea.

```bash
cd /c/Users/Danny/code/kredian
git checkout main
git pull origin main
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000

## Lo que tenés que hacer vos (clics, no código)

1. **Supabase** → proyecto `kredian`.
2. Settings → API: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
3. Authentication → Email: desactivá **Confirm email**.
4. URL configuration: Site URL `http://localhost:3000`.
5. SQL Editor: pegá **todo** `supabase/schema.sql` y Run (incluye tablas, RLS y semilla de rangos).
6. **Sepolia** en el mismo `.env.local`:
   - `SEPOLIA_RPC_URL` (Alchemy o Infura)
   - `SEPOLIA_PRIVATE_KEY` (wallet nueva, solo ETH de prueba)
   - `KREDIAN_CONTRACT_ADDRESS=0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E`
7. En `/perfil`, el **nombre** tiene que coincidir con el de la insignia de Credly (si Credly no se puede leer, el plan B espera `Danny Carvajal`).
8. Flujo: Entrar → pegar link → Leer insignia → Sellar → abrir `/u/tu-usuario` → Comprobar sello.
9. Video (guion en `PROYECTO.md` sección 12). Vercel es opcional.

Las llaves nunca van al repo.
