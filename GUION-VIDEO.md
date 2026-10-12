# Guion del video — Kredian

> **Legado para Cursor y para quien graba.**  
> Si te piden un guion, leé este archivo **entero** y `PROYECTO.md` (secciones 1, 2, 10 y 11).  
> Entregá el texto **listo para leer en voz alta**, con marcas de pantalla. No improvises el producto.

---

## Prompt para pegar en Cursor (compañero del video)

```
Leé GUION-VIDEO.md completo y PROYECTO.md secciones 1, 2, 7, 10, 11 y 12.
Soy quien va a grabar el video de entrega de Kredian.

Dame:
1. El guion hablado en español, listo para leer (voz natural, Costa Rica, vos/usted mixto informal).
2. Qué se ve en pantalla en cada bloque (ruta + clic).
3. La versión corta (~90 s) y la completa (~2 min).
4. Qué decir si usamos plan B (JSON de ejemplo) o una insignia real de Credly.

No inventes emisores, CSV, Resend, Apple, Accredible, Stellar, ni mainnet.
No pidas .env. Usá la URL de Vercel del equipo (o localhost si falló el deploy).
No pegues secretos. Sepolia es red de pruebas. El sello es un hash, no PII.
```

---

## Qué tiene que saber Cursor (contexto, no lo leas en cámara)

### Producto
Kredian **no emite** certificaciones. Lee insignias públicas de **Credly**, compara el nombre con el perfil, y si cuadra deja un **sello (hash SHA-256)** en **Sepolia**. El reclutador abre `/u/[usuario]` y pulsa **Comprobar sello** (Etherscan).

Frase canónica: *«Verifica certificaciones tech de Credly y deja un sello en blockchain que cualquier reclutador puede comprobar sin confiar en nosotros.»*

### Dónde está el código
- App: Next.js App Router, UI en español.
- Home: planta (verde oscuro) → papel (tarjeta de credencial) → sello (oro).
- Login: solo correo/contraseña (`/login`). Google no está.
- Perfil: `/perfil` — nombre **exacto** al de la insignia (plan B: `Danny Carvajal`).
- Público: `/u/[usuario]` — no hace falta cuenta.
- Contrato: `KredianSellos.sellar(bytes32)` en Sepolia `0x55C27efcF6d8707315f95FEaC8Ad569488fEe75E`.

### Cómo se graba (equipo)
1. Danny deploya en Vercel una vez (README). El resto **no clona ni arma `.env`**.
2. Abrir la URL de Vercel. Si no hay URL, `npm run dev` en la máquina de Danny.
3. Cuenta de demo: crear una en `/login` o reusar la de Danny.
4. Nombre del perfil = nombre de la insignia.

### Plan B (si Credly no scrapeó)
Tres URLs distintas. Nombre del perfil: **Danny Carvajal**.

| En pantalla | URL |
|---|---|
| AWS Educate Introduction to Cloud 101 | `https://www.credly.com/badges/plan-b-aws-educate-cloud-101/public_url` |
| AWS Certified Cloud Practitioner | `https://www.credly.com/badges/plan-b-aws-cloud-practitioner/public_url` |
| CompTIA Security+ | `https://www.credly.com/badges/plan-b-comptia-security-plus/public_url` |

Código: `src/data/credly-ejemplos.ts`. **En el video hay que decirlo** si se usaron estos links (JSON de ejemplo / plan B). No fingir que son insignias scrapeadas en vivo.

Si hay insignia **real** de Credly (UUID en la URL), usar esa. El nombre del perfil debe coincidir (comparación NFD, mayúsculas da igual).

### Honestidad obligatoria (al menos una frase)
- Sepolia = red de **pruebas**, no dinero real.
- En cadena va **solo un hash**, nunca el nombre ni el correo.
- Comparar nombres **no prueba al 100%** que la insignia sea tuya (futuro: correo).
- Leemos la página pública de Credly; no hay API oficial de terceros.

### No inventar / no mostrar
- Emisores, CSV, Resend, Apple, Accredible, Open Badges, GitHub skills.
- Stellar / Raven / otra chain: es **otro** hackathon, no este MVP.
- Ethereum mainnet, tokens “Sepolia ETH” como si fueran un token ERC-20. Es ETH de testnet.
- Secretos, `.env`, private keys, Alchemy keys.
- “Smart contract auditable en producción” / “inmutable para siempre en Ethereum”.
- Rangos calculados con IA. Son una tabla (~20 certs → Bronce/Plata/Oro/Platino).

### Duración
Clase: **~2 minutos**. Priorizá demo. Si recortan, usá la versión de 90 s.

### Tono
Informal, claro, sin jerga de whitepaper. “Sello” mejor que “transacción”. “Comprobar” mejor que “verificar on-chain”.

---

## Versión completa (~2 min) — leer esto

Marcas: **[PANTALLA]** = qué mostrar. *Cursiva* = acción, no se lee.

### 1. Problema (~15 s)

**[PANTALLA]** Home `/` — headline *«Un sello que el CV no puede mentir»*. Scroll suave, hojas de fondo. No hables todavía 1 segundo.

**HABLAR:**
«¿Cómo sabés que ese AWS del CV es real? Cualquiera lo escribe en LinkedIn. Al reclutador le toma un montón revisar cada certificado, y si vence o lo revocan, nadie se entera.»

### 2. Qué es Kredian (~12 s)

**[PANTALLA]** Seguí en home. Señalá *«No somos emisores. Somos verificadores.»*

**HABLAR:**
«Kredian verifica las certificaciones tech que ya tenés en Credly y deja un sello en blockchain. Cualquier reclutador lo puede comprobar sin confiar en nosotros. No emitimos el título: lo leemos y lo lacrarmos.»

### 3. Demo — entrar (~12 s)

**[PANTALLA]** Clic **Entrar** → `/login`. Correo + contraseña (cuenta ya creada). *No muestres contraseñas en zoom.*

**HABLAR:**
«Entras con correo. Armás tu perfil: el nombre tiene que ser el mismo que aparece en la insignia.»

### 4. Demo — leer y sellar (~50–70 s)

**[PANTALLA]** `/perfil`. Mostrá el nombre. Pegá **un** link (el de AWS Educate 101 está bien para el primer sello). Clic **Leer insignia**. Esperá a que salga título, emisor, fecha, vigente. Clic **Sellar**. Esperá el hash / **Ver en Etherscan**. Abrí Etherscan un segundo (Sepolia). Volvé. Si hay tiempo, pegá un segundo link (Cloud Practitioner o Security+) y repetí rápido.

**HABLAR (insignia real):**
«Pegás el link público de Credly. Kredian lee nombre, emisor, fecha y si sigue vigente. Si el nombre cuadra, sellamos: un hash en Sepolia. Acá está la transacción en Etherscan. Eso ya no depende de que nuestra base de datos diga la verdad.»

**HABLAR (plan B — si usaste las URLs `plan-b-…`):**
«Para el demo usamos el plan B: un JSON de ejemplo cuando Credly no deja leer la página. El flujo es el mismo: leer, validar el nombre, sellar. El hash sí queda en Sepolia de verdad.»

### 5. Demo — reclutador (~20 s)

**[PANTALLA]** Abrí `/u/` + el usuario del perfil (link del perfil público). Clic **Comprobar sello**. Etherscan otra vez. Mostrá rango (Bronce a Platino) si se ve.

**HABLAR:**
«El reclutador no necesita cuenta. Entra al perfil público, ve la credencial y pulsa Comprobar sello. Si el hash está en la cadena, el papel no es un PDF que alguien se inventó esta mañana.»

### 6. Por qué blockchain (~15 s)

**[PANTALLA]** Home, bloque *Por qué blockchain* (scroll) **o** quedate en Etherscan.

**HABLAR:**
«El sello es un testigo neutral: en tal fecha esa insignia existía y estaba vigente. Ni nosotros lo podemos borrar. En la cadena solo va un hash, nunca tu nombre ni tu correo. Y esto es Sepolia, red de pruebas — no hay plata de por medio.»

### 7. Futuro (~12 s)

**[PANTALLA]** Home, rangos, o logo.

**HABLAR:**
«A futuro: que universidades de Costa Rica emitan directo acá, más fuentes además de Credly, y prueba de habilidad con GitHub. Hoy el MVP es uno: Credly, nombre, sello.»

### 8. Cierre (~5 s)

**[PANTALLA]** Home, logo Kredian, headline.

**HABLAR:**
«Kredian: de la planta al papel, y al sello. Gracias.»

---

## Versión corta (~90 s)

1. Home: problema + una frase de qué es (~20 s).
2. Login → perfil → un solo link → Leer → Sellar → Etherscan (~40 s).
3. `/u/...` → Comprobar sello (~15 s).
4. «Sepolia, hash, no somos emisores. Gracias.» (~10 s).

Si plan B: una sola frase: *«El lector usó el ejemplo de respaldo; el sello en Sepolia es real.»*

---

## Checklist de grabación (humano)

- [ ] URL de Vercel (o localhost en la máquina de Danny).
- [ ] Ventana limpia: sin `.env`, Discord, otras pestañas con keys.
- [ ] Cuenta lista; nombre = `Danny Carvajal` si es plan B.
- [ ] Links de insignia copiados en un bloc (no buscarlos en cámara).
- [ ] MetaMask **no** hace falta para el demo del equipo: el sello lo firma el backend.
- [ ] Si Etherscan tarda, dejá el loader; no recortes a un fail.
- [ ] Grabá de más en el sello; recortá en edición.
- [ ] Si Credly real falla en vivo: cambiá a plan B y **decilo**.
- [ ] No prometas mainnet ni “certificación oficial de AWS”.

---

## Si Cursor tiene que adaptar el guion

- Recortar: cortá futuro y el segundo certificado. No cortes honestidad de Sepolia.
- Alargar: un segundo certificado y un zoom al rango.
- Voz de reclutador: repetí el bloque 5 en segunda persona (*«usted entra al perfil…»*).
- No reescribas el producto. Si falta una pantalla, mirá `src/app/` y `src/components/Inicio.tsx`; no inventes UI.
- URL de Vercel: si está en el README, úsala; si dice `(tu-proyecto).vercel.app`, decí “la URL que les pasó Danny”.
