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
| 3 sellos seguidos, contrato verificado (10 oct) | [`0x0d0124f3…`](https://sepolia.etherscan.io/tx/0x0d0124f3bed5a03ea655d5e67d0d86db6b466d2bd25403331c40bf4a42e69a1d) · [`0x91ca2b27…`](https://sepolia.etherscan.io/tx/0x91ca2b271784589ebfc80917273c159f7f802ec759558184b11ba8f4a4e9e059) · [`0x85f39a1f…`](https://sepolia.etherscan.io/tx/0x85f39a1fb014378fddbee49aa0f9ee1f4fb13fbd85582c410774d60942bca067) |

## Cómo configurar `.env.local` para el sello

No subas este archivo ni pegues llaves reales en el repo ni en el chat. Si no existe, copiá `.env.example`.

1. Wallet nueva en MetaMask, solo para Kredian, con ETH de prueba de Sepolia.
2. En Alchemy o Infura, copiá la URL RPC de Sepolia.
3. Exportá la llave privada de esa wallet (sirve con o sin `0x`).
4. Dejá la dirección del contrato tal cual. Ya está desplegado.

```
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
KREDIAN_CONTRACT_ADDRESS=0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E
```

Sin `SEPOLIA_RPC_URL` y `SEPOLIA_PRIVATE_KEY`, `/api/sellar` no puede firmar. `/api/comprobar` necesita la dirección del contrato; si no hay RPC, usa un nodo público de respaldo. Las mismas tres variables van en Vercel → Settings → Environment Variables.

## Archivos

| Archivo | Qué hace |
|---|---|
| `src/lib/blockchain.ts` | Hash canónico, validación, conexión al contrato y `sellarCredencial()` |
| `src/lib/sellar-solicitud.ts` | Sesión, dueño de la credencial y guardado de `hash` / `tx_hash` / `sellado_en` |
| `src/app/api/sellar/route.ts` | `POST /api/sellar` — exige sesión, sella la fila y guarda el resultado |
| `src/app/api/comprobar/route.ts` | `POST /api/comprobar` — recalcula el hash y lo busca en el contrato |
| `src/components/BotonComprobarSello.tsx` | Botón "Comprobar sello" + link a Etherscan |
| `src/components/BotonSellar.tsx` | En `/perfil`, `POST /api/sellar` con `credencial_id` |
| `src/app/u/[usuario]/page.tsx` | Perfil público, sin login, con el botón de comprobar |
| `scripts/probar-sello.ts` | `npm run probar:sello` — 3 sellos seguidos de prueba |

## Cómo integrarlo (Danny)

### 1. Sellar, después de validar Credly + nombre

La fila ya tiene que estar en `credenciales` y ser del usuario logueado.
`POST /api/sellar` exige la cookie de sesión y **solo** acepta:

```json
{ "credencial_id": "uuid-de-la-fila" }
```

Lee `fuente`, `badge_id`, `titulo`, `emisor`, `fecha_emision` y `estado` de esa fila.
No armes el hash con lo que manda el navegador.

La misma ruta guarda en la fila:

- `hash`
- `tx_hash`
- `sellado_en` = el `verificado_en` exacto que entró al hash (sección 7). No es el timestamp del bloque. `/api/comprobar` recalcula el sha256 con esta columna.

`sellarCredencial()` queda para scripts del servidor (`npm run probar:sello`). La firma sigue solo en el servidor.

> El `timestamptz` de Supabase vuelve como `+00:00`. Al leer `sellado_en` se normaliza a ISO UTC; por eso el hash recalculado sigue coincidiendo.

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
    sellado_en: c.sellado_en, // Acepta sellado_en directo de Supabase
  }}
/>
```

Con `datosCredencial`, el servidor recalcula el hash (lo que pide la sección 7) y además lo
compara con `hash`: si alguien editó la credencial en la base de datos después de sellarla,
muestra "Sello no verificado".

## Probar

```bash
npm test                    # Tests unitarios locales (sin gastar gas)
npm run probar:sello        # 3 sellos seguidos en Sepolia (gasta un poco de ETH de prueba)
npm run probar:sello -- 1   # solo uno
```

## Límites conocidos (para el video, con honestidad)

- `/api/sellar` exige sesión y que la credencial sea del usuario. La wallet del servidor igual paga el gas de Sepolia; por eso no acepta datos sueltos del navegador.
- Es Sepolia (red de pruebas), no dinero real.
