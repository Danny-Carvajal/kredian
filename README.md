# Kredian

Verifica certificaciones tech de Credly y deja un **sello en blockchain** que cualquier reclutador puede comprobar.

Repo: https://github.com/Danny-Carvajal/kredian  
La fuente de verdad del producto es [`PROYECTO.md`](./PROYECTO.md).  
El código está en **`main`**.

**El equipo no tiene que armar `.env`.** Eso lo hace una sola vez Danny y se publica en Vercel. El resto abre la URL y graba.

Cuando el deploy esté listo, la demo es: `https://(tu-proyecto).vercel.app`

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (login y base de datos)
- Sepolia + ethers.js v6 (sello)

## Vercel (una vez, cuenta de Danny)

1. Entrá a [vercel.com](https://vercel.com) con GitHub (`Danny-Carvajal`).
2. **Add New… → Project → Import** el repo `kredian`.
3. Framework: Next.js. Root: `.`
4. **Environment Variables** — las mismas 5 de tu `.env.local` (no las pegues en el chat). Marcá Production, Preview y Development:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SEPOLIA_RPC_URL`
   - `SEPOLIA_PRIVATE_KEY`
   - `KREDIAN_CONTRACT_ADDRESS`

5. **Deploy**. Copiá la URL (`https://kredian-….vercel.app`).
6. En **Supabase → Authentication → URL Configuration**:
   - Site URL: esa URL de Vercel
   - Redirect URLs: la de Vercel **y** `http://localhost:3000/**`
7. Mandale al equipo **solo la URL**. Con eso entran, sellan y graban. Sin clone, sin Alchemy, sin MetaMask.

Si el login en Vercel falla, casi seguro faltó el paso 6.

## Clonar (solo si alguien quiere correrlo en su PC)

Una línea a la vez. En Git Bash usá `/`, no `\`.

```bash
mkdir -p ~/code
cd ~/code
git clone https://github.com/Danny-Carvajal/kredian.git
cd kredian
git checkout main
git pull origin main
npm install
cp .env.example .env.local
```

Si **ya** tenés la carpeta:

```bash
cd ~/code/kredian
git checkout main
git pull origin main
npm install
```

No subas `.env.local`. Las llaves no van al chat ni al repo.

## `.env.local`

Copiá esto y llená los valores (el contrato ya está):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
KREDIAN_CONTRACT_ADDRESS=0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E
```

1. **Supabase** → proyecto `kredian`.
2. **Connect** (botón verde) o Project ID + `.supabase.co`: `NEXT_PUBLIC_SUPABASE_URL` (`https://xxxx.supabase.co`).
3. **API Keys → Legacy anon**: la key `eyJ...` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No uses `sb_secret_`.
4. Authentication → Providers → Email: apagá **Confirm email**.
5. URL configuration: Site URL `http://localhost:3000`.
6. SQL Editor: pegá **todo** [`supabase/schema.sql`](./supabase/schema.sql) y **Run**.
7. Alchemy, red **Sepolia** (la URL tiene que decir `eth-sepolia`) → `SEPOLIA_RPC_URL`.
8. MetaMask, cuenta de **prueba**, red Sepolia, ETH de faucet → `SEPOLIA_PRIVATE_KEY`.

Después:

```bash
npm run dev
```

http://localhost:3000

## Demo / video

Guion: `PROYECTO.md` sección 12.

1. Home oscura (planta) → **Entrar**.
2. Crear cuenta o entrar.
3. Perfil: nombre igual al de la insignia. Plan B: **`Danny Carvajal`**.
4. Pegar **un link por insignia** y leer + sellar cada una. Si Credly tiene badges públicas reales, usá esas. Si no, plan B (nombre del perfil: **Danny Carvajal**), tres URLs distintas:

   - `https://www.credly.com/badges/plan-b-aws-educate-cloud-101/public_url`
   - `https://www.credly.com/badges/plan-b-aws-cloud-practitioner/public_url`
   - `https://www.credly.com/badges/plan-b-comptia-security-plus/public_url`

5. **Leer insignia** → **Sellar** → **Ver en Etherscan**.
6. Abrir `/u/tu-usuario` → **Comprobar sello**.

En el video: si usaron el JSON de ejemplo, decilo. Sepolia es red de pruebas.

## Si algo falla

- `fetch failed` / `Could not resolve host`: la URL de Supabase está mal o falta reiniciar `npm run dev` después de editar `.env.local`.
- `public.profiles`: no corriste `schema.sql`.
- Overlay `profiles_pkey`: recargá `/perfil`; el perfil ya existe.
- Faucet Alchemy pide ETH de mainnet: usá [Google Cloud Sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) o [PoW](https://sepolia-faucet.pk910.de/).
