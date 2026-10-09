# Sello en Sepolia — Web3 (Daniel Corrales)

Todo lo de blockchain de Kredian según la sección 7 de [`PROYECTO.md`](../PROYECTO.md).

## Contrato desplegado

| Dato | Valor |
|---|---|
| Red | Sepolia (chainId `11155111`) |
| Contrato | [`0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E`](https://sepolia.etherscan.io/address/0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E) |
| Código | [`KredianSellos.sol`](./KredianSellos.sol) (idéntico al de la sección 7, sin cambios) |
| Primer sello de prueba | [`0x1578b57d…a9ee`](https://sepolia.etherscan.io/tx/0x1578b57d7e3dbcd994030912bf798590fdd37baf7d6409f841bcfd264327a9ee) |
| 3 sellos seguidos sin fallos (8 oct) | [`0x448ed6f9…`](https://sepolia.etherscan.io/tx/0x448ed6f933ddf1f047c3a93455d872307ec5bc8664576386568f5aa92589db2d) · [`0x9baf97f0…`](https://sepolia.etherscan.io/tx/0x9baf97f0af6c8ae6a03d8529a69a23463ce2e5f1861606253ae5546a73419772) · [`0x06c0b7e8…`](https://sepolia.etherscan.io/tx/0x06c0b7e8e08f3d9a5bd09837309db94a4f700cbd35a4093e4bfd5a1b60d4aebd) |

## Variables en `.env.local` (nunca al repo)

```
SEPOLIA_RPC_URL=            # Alchemy o Infura (Sepolia)
SEPOLIA_PRIVATE_KEY=        # wallet SOLO de pruebas
KREDIAN_CONTRACT_ADDRESS=0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E
```

Las mismas tres van en Vercel → Settings → Environment Variables.

## Archivos

| Archivo | Qué hace |
|---|---|
| `src/lib/blockchain.ts` | Hash canónico, validación, conexión al contrato y `sellarCredencial()` |
| `src/app/api/sellar/route.ts` | `POST /api/sellar` — firma en el servidor y sella |
| `src/app/api/comprobar/route.ts` | `POST /api/comprobar` — recalcula el hash y lo busca en el contrato |
| `src/components/BotonComprobarSello.tsx` | Botón "Comprobar sello" + link a Etherscan |
| `scripts/probar-sello.ts` | `npm run probar:sello` — 3 sellos seguidos de prueba |

## Cómo integrarlo (Danny)

### 1. Sellar, después de validar Credly + nombre

Desde una server action o ruta del servidor (no hace falta pasar por HTTP):

```ts
import { sellarCredencial } from "@/lib/blockchain";

const verificado_en = new Date().toISOString();
const r = await sellarCredencial({
  fuente: "credly",
  badge_id, titulo, emisor,
  fecha_emision,          // "YYYY-MM-DD"
  estado,                 // "vigente" | "vencida" | "revocada"
  verificado_en,
});

// Guardar en `credenciales`:
//   hash       = r.hash
//   tx_hash    = r.tx_hash
//   sellado_en = r.datos.verificado_en   ← IMPORTANTE (ver abajo)
```

O desde el servidor/cliente con `fetch("/api/sellar", { method: "POST", body: JSON.stringify(datos) })`.
La respuesta trae `hash`, `tx_hash`, `etherscan_url`, `verificado_en`, `sellado_en_blockchain`,
`ya_existia` y `confirmado`. En la tabla se guarda `verificado_en` (no `sellado_en_blockchain`,
que es solo la hora del bloque, informativa).

> **Importante:** el hash incluye `verificado_en`. La tabla `credenciales` no tiene esa columna,
> así que guardá ese mismo valor en `sellado_en`. Si guardás otra hora, "Comprobar sello"
> no va a poder recalcular el hash.
> El formato que devuelve Supabase (`+00:00`) ya se normaliza solo, no hay que tocarlo.

### 2. "Comprobar sello" en `/u/[usuario]`

```tsx
import BotonComprobarSello from "@/components/BotonComprobarSello";

<BotonComprobarSello
  hash={c.hash}
  txHash={c.tx_hash}
  datosCredencial={{
    fuente: c.fuente,
    badge_id: c.badge_id,
    titulo: c.titulo,
    emisor: c.emisor,
    fecha_emision: c.fecha_emision,
    estado: c.estado,
    verificado_en: c.sellado_en,
  }}
/>
```

Con `datosCredencial`, el servidor recalcula el hash (lo que pide la sección 7) y además lo
compara con `hash`: si alguien editó la credencial en la base de datos después de sellarla,
muestra "Sello no verificado".

## Probar

```bash
npm run probar:sello        # 3 sellos seguidos (gasta un poco de ETH de prueba)
npm run probar:sello -- 1   # solo uno
```

## Límites conocidos (para el video, con honestidad)

- `/api/sellar` es pública y la wallet paga el gas: alguien podría gastar el ETH de prueba.
  Cuando exista el login, conviene llamar a `sellarCredencial()` solo desde el servidor
  con un usuario logueado.
- Es Sepolia (red de pruebas), no dinero real.
