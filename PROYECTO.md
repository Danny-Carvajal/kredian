# Kredian — PROYECTO.md

> **Este archivo es la única fuente de verdad del proyecto.**
> Si algo no está aquí, no está decidido. Si el PDF viejo o un chat dicen otra cosa, manda este archivo.
> Cursor y cualquier IA deben leer este archivo completo antes de escribir código.
> En especial la **sección 4** (modo solo), la **sección 9** (plan) y la **sección 15**.
> Solo Danny edita este archivo.
>
> **8 oct — modo solo:** José, Juliana y Daniel no se ve que vayan a codear.
> Danny + Cursor entregan el MVP. El plan vigente es la **sección 9 (plan solo)**.
> La guía para Cursor es la **sección 15 — Modo solo**. No esperar PRs del resto del equipo.

---

## 1. Qué es Kredian (en una frase)

Kredian verifica las certificaciones tech que ya tenés (Credly) y deja un **sello en blockchain** que cualquier reclutador puede comprobar sin confiar en nosotros.

**No somos emisores. Somos verificadores.** No competimos con Credly, lo usamos como fuente.

### El problema
- Cualquiera puede escribir "AWS Certified" en su CV o LinkedIn.
- Revisar cada certificado a mano le toma tiempo al reclutador.
- Las certificaciones vencen o se revocan y nadie se entera.

### Nuestra solución
1. El usuario pega el link público de su insignia de Credly.
2. Kredian lee los datos de la insignia (nombre, emisor, fecha, estado).
3. Kredian compara el nombre de la insignia con el nombre del perfil.
4. Si todo cuadra, Kredian guarda un **sello** (hash) en la blockchain de pruebas Sepolia.
5. El perfil público muestra la insignia con su rango (Bronce a Platino) y el botón "Comprobar sello".

### Por qué blockchain (para el pitch)
- El sello es un **testigo neutral**: prueba que en tal fecha esa insignia existía y estaba vigente.
- **Ni nosotros podemos alterarlo** ni borrarlo, aunque cambiemos nuestra base de datos.
- El reclutador puede comprobar el sello en Etherscan sin confiar en Kredian.
- En blockchain **solo va un hash**, nunca datos personales.

### Limitaciones que decimos con honestidad en el video
- Comparar nombres no prueba al 100% que la insignia sea tuya. Mejora futura: verificar correo.
- Leemos la página pública de Credly; no es una API oficial para terceros. Para producción haría falta un acuerdo.
- Usamos Sepolia (red de pruebas), no dinero real.

---

## 2. Alcance

### SÍ se construye (MVP)
- Login con Google y con correo (Supabase Auth).
- Perfil editable: nombre, foto, descripción.
- Campo "Pegar link de Credly".
- Lector de insignias de Credly (una sola fuente).
- Validación por nombre.
- Sello en Sepolia + link a Etherscan.
- Perfil público para contratantes (sin cuenta).
- Tabla de rangos con ~20 certificaciones (Bronce, Plata, Oro, Platino).

### Si sobra tiempo
- Búsqueda de perfiles.
- Ranking por área.

### NO se construye (no lo pidan a Cursor)
- Emisores, carga de CSV, sal, llaves por correo, Resend.
- Login con Apple.
- Otras fuentes (Accredible, Open Badges, GitHub).
- Proyectos o experiencia laboral verificada.
- Cálculo automático de rangos.

### Futuro (solo se menciona en el video)
- "Camino B": universidades de Costa Rica emiten títulos directo en Kredian.
- Más fuentes: Accredible, Open Badges.
- Prueba de habilidad con commits de GitHub.

---

## 3. Stack (decidido, no se cambia)

| Pieza | Herramienta |
|---|---|
| Web | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Login y base de datos | Supabase (plan gratis) |
| Blockchain | Sepolia + contrato mínimo en Solidity (desplegado con Remix) |
| Librería blockchain | ethers.js v6 |
| Publicar la web | Vercel (plan gratis) |
| Código | Un solo repo en GitHub |

Idioma de la interfaz: **español**.

---

## 4. Quién construye (modo solo, 8 oct)

Entrega: **lunes 12 de octubre.** El producto no cambia (secciones 1–3, 6–8). Cambia quién lo arma.

**Danny + Cursor hacen todo el código.** No se espera trabajo de José, Juliana ni Daniel. Si aparecen, pueden ayudar; no bloqueamos por ellos.

| Qué | Quién |
|---|---|
| Código (pantallas, APIs, diseño usable, flujo completo) | Cursor, Danny revisa y mergea |
| Proyecto Supabase, tablas en el dashboard, Auth, keys | Danny (clicks) + Cursor (SQL y código) |
| MetaMask, ETH Sepolia, Remix, address del contrato | Danny (clicks) |
| Insignia pública de Credly | Danny |
| Video y (si da) Vercel | Danny |

Rama: `danny/...` o la del agente. Cursor **no pregunte** por José/Juliana/Daniel para poder seguir. Programá el MVP entero, en el orden de la sección 9.

Créditos del video, si aplica: José, Juliana, Daniel, Danny. El código lo saca Danny.

---

## 5. Reglas de trabajo (para que nada se caiga a pedazos)

1. **No trabajar directo en `main`.** Rama `danny/...` o la del agente. Squash and merge a `main`.
2. **Pedazos chiquitos** cuando se pueda. Con el reloj del lunes, un PR por bloque del plan (login / Credly+sello / pulido) está bien.
3. **Cursor lee este archivo entero** (secciones 2, 4, 9 y 15 modo solo) antes de codear.
4. **Si Cursor propone algo que no está acá, no.**
5. **Llaves secretas nunca van al repo.** Van en `.env.local`.
6. **La wallet es solo de pruebas.** Nada de dinero real.
7. **No esperar al resto del equipo** para integrar. Si alguien manda código, se mira; si no, se sigue.

---

## 6. Datos (tablas en Supabase)

Dueño en modo solo: **Danny + Cursor**. No rediseñar columnas.

### `profiles`
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | mismo id que el usuario de Supabase Auth |
| nombre | text | nombre real, se compara con la insignia |
| usuario | text | único, se usa en la URL pública `/u/[usuario]` |
| foto_url | text | |
| descripcion | text | |
| creado_en | timestamp | |

### `credenciales`
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| user_id | uuid | dueño |
| fuente | text | por ahora siempre `"credly"` |
| url | text | link que pegó el usuario |
| badge_id | text | id de la insignia en Credly |
| titulo | text | ej. "AWS Educate Introduction to Cloud 101" |
| emisor | text | ej. "Amazon Web Services" |
| nombre_en_insignia | text | |
| fecha_emision | date | |
| fecha_vencimiento | date | puede ser null |
| estado | text | `vigente`, `vencida`, `revocada` |
| nombre_coincide | boolean | |
| hash | text | el sello (sha256) |
| tx_hash | text | transacción en Sepolia |
| sellado_en | timestamp | |
| rango | text | `bronce`, `plata`, `oro`, `platino` o null |

### `rangos`
| Campo | Tipo |
|---|---|
| id | uuid |
| patron | text (texto que se busca en el título de la insignia) |
| area | text |
| subarea | text |
| rango | text |
| peso | int (1 a 4) |

### Permisos (RLS)
- Cualquiera puede **leer** `profiles`, `credenciales` y `rangos` (el perfil es público).
- Solo el dueño puede **crear, editar o borrar** sus filas.

---

## 7. Cómo se calcula el sello

Dueño en modo solo: **Danny + Cursor**. No cambiar el orden de las claves ni el contrato mínimo.

1. Se arma este objeto, **sin datos personales**:
```json
{
  "fuente": "credly",
  "badge_id": "...",
  "titulo": "...",
  "emisor": "...",
  "fecha_emision": "YYYY-MM-DD",
  "estado": "vigente",
  "verificado_en": "ISO timestamp"
}
```
2. Se convierte a texto con las claves **en ese orden exacto**.
3. Se calcula `sha256` de ese texto.
4. Se manda el hash al contrato con la función `sellar(bytes32 hash)`.
5. Se guarda `hash` y `tx_hash` en la tabla `credenciales`.

**Comprobar sello:** recalcular el hash con los datos guardados y confirmar en el contrato que existe. Si coincide, se muestra "Sello verificado".

### Contrato mínimo
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KredianSellos {
    mapping(bytes32 => uint256) public selladoEn;
    event Sellado(bytes32 indexed hash, uint256 fecha);

    function sellar(bytes32 hash) external {
        require(selladoEn[hash] == 0, "Ya sellado");
        selladoEn[hash] = block.timestamp;
        emit Sellado(hash, block.timestamp);
    }
}
```
La firma de transacciones se hace **solo en el servidor** (ruta API de Next.js), con la llave privada en `.env.local`.

---

## 8. Pantallas

| Ruta | Qué muestra | Quién la ve | Dueño del código |
|---|---|---|---|
| `/` | Inicio: qué es Kredian, botón "Entrar" | todos | Danny + Cursor. Ya hay texto base. |
| `/login` | Google o correo | todos | Danny + Cursor |
| `/perfil` | Editar perfil + pegar link + mis credenciales | dueño | Danny + Cursor |
| `/u/[usuario]` | Perfil público con insignias y "Comprobar sello" | todos, sin cuenta | Danny + Cursor |
| `/rangos` | Tabla de rangos (solo si sobra tiempo) | todos | Danny + Cursor |

### Variables de entorno (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
KREDIAN_CONTRACT_ADDRESS=
```

Danny llena las cinco en `.env.local`. Nadie las sube a GitHub.

---

## 9. Plan día por día (entrega: lunes 12 de octubre)

Marcá `[x]` cuando termines una tarea.

### Martes 6 — Arranque
**Todos**
- [ ] Crear cuenta de GitHub (si no tienen).
- [ ] Instalar Cursor.
- [ ] Instalar Git.
- [ ] Mandar su usuario de GitHub a Danny.

**Danny**
- [x] Crear el repo `kredian` en GitHub.
- [ ] Invitar a los otros 3.
- [x] Subir este `PROYECTO.md`.
- [ ] Inscribirse en un curso gratis con insignia de Credly (ver sección 11).

**José**
- [ ] Crear cuenta en Supabase.
- [ ] Crear el proyecto `kredian`.
- [ ] Mandar URL y anon key a Danny por privado.

**Juliana**
- [ ] Instalar MetaMask en el navegador.
- [ ] Crear una wallet **nueva** solo para Kredian.
- [ ] Conseguir ETH de prueba de Sepolia en un faucet.
- [ ] Crear cuenta gratis en Alchemy o Infura y sacar la URL RPC de Sepolia.

**Daniel**
- [ ] Buscar 3 webs que le gusten como referencia visual.
- [ ] Proponer 2 colores principales y un logo sencillo para Kredian.

### Miércoles 7 — Base del proyecto
**Danny**
- [x] Con Cursor, crear el proyecto Next.js + TypeScript + Tailwind.
- [x] Crear `.gitignore` con `.env.local`.
- [x] Subir a `main`.
- [ ] Avisar en el grupo: "ya pueden clonar".

**Todos**
- [ ] Clonar el repo.
- [ ] Crear su rama (`jose/...`, `juliana/...`, `daniel/...`, `danny/...`).
- [ ] Correr `npm install` y `npm run dev`.
- [ ] Confirmar que ven la página en `localhost:3000`.
- [ ] Abrir Cursor **en esa carpeta**, pegar el prompt de la sección 15 de su nombre.

**José**
- [ ] Crear las 3 tablas de la sección 6.
- [ ] Activar login con correo.
- [ ] Activar login con Google.

**Juliana**
- [ ] Abrir Remix (remix.ethereum.org).
- [ ] Pegar el contrato de la sección 7.
- [ ] Desplegarlo en Sepolia con MetaMask.
- [ ] Guardar la dirección del contrato y mandarla a Danny.

**Danny**
- [ ] Probar si la página pública de la insignia de Credly se puede leer desde el servidor.
- [ ] Si no se puede, guardar un JSON de ejemplo como plan B (sección 10).

**Daniel**
- [ ] Diseñar la pantalla `/` (inicio).

### Plan solo (vigente) — jueves 8 a lunes 12

Estado al 8 oct: Next.js + Tailwind + home stub en `main`. Falta login, tablas, Credly, sello, perfil público, pulido y video.

**Orden de corte si se atrasa** (se entrega igual el video):
1. Login solo correo (sin Google).
2. Credly no se puede leer → JSON de ejemplo (sección 10).
3. Sin ETH de Sepolia → otro faucet; si no hay, se graba el hash calculado y se dice el plan B con honestidad.
4. Rangos → insignias sin rango.
5. Vercel → video en `localhost`.

---

#### Lo que Danny hace a mano (sin esto el código no corre del todo)

- [ ] Cuenta y proyecto **Supabase** `kredian`. Pegar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
- [ ] En Supabase: Auth con **correo**. Google solo si sale en un rato.
- [ ] Pegar en el SQL Editor el script de tablas+RLS que arme Cursor.
- [ ] MetaMask, wallet **nueva** de pruebas, ETH de Sepolia (faucet), URL RPC (Alchemy o Infura).
- [ ] Remix: pegar contrato sección 7, desplegar en Sepolia. Pegar `SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`, `KREDIAN_CONTRACT_ADDRESS` en `.env.local`.
- [ ] Una insignia **pública** de Credly (sección 11). Si no hay tiempo de curso, plan B JSON.

---

#### Jueves 8 — Login y datos

Cursor escribe; Danny pega keys y SQL.

- [x] Archivo SQL: tablas `profiles`, `credenciales`, `rangos` + RLS (sección 6).
- [x] Cliente Supabase en Next.js.
- [x] `/login` con correo. Al entrar, crear fila en `profiles` si no existe.
- [x] `/perfil`: nombre, foto, descripción editables + hueco "pegar link de Credly".
- [ ] Probar: registrarse, entrar, ver `/perfil`. (Danny, con keys reales)

#### Viernes 9 — Flujo que se graba

Un solo camino: pegar link → leer → validar nombre → sellar → guardar → perfil público → comprobar.

- [ ] `/api/credly` (o JSON de ejemplo si Credly no responde).
- [ ] Comparar nombres (sin tildes, sin mayúsculas).
- [ ] `/api/sellar` y `/api/comprobar` (ethers.js v6, firma solo en servidor, contrato sección 7).
- [ ] En `/perfil`: pegar link dispara el flujo y lista credenciales.
- [ ] `/u/[usuario]` público, botón "Comprobar sello", link Etherscan.
- [ ] Probar el flujo **una vez** de punta a punta.

#### Sábado 10 — Que se vea producto

- [ ] Home, login, perfil y público con un look simple (2 colores, no premio de diseño).
- [ ] Tarjeta de credencial + 4 insignias de rango.
- [ ] Seed de ~20 filas en `rangos` y asignar rango al guardar. Si no llega: sin rango.
- [ ] Estados de carga y error.
- [ ] Probar sello 3 veces. Publicar Vercel si da; si no, localhost.

#### Domingo 11 — Video

- [ ] Mediodía: congelar features. Solo bugs.
- [ ] Grabar el flujo (sección 12).
- [ ] Voz del pitch. Editar. Plan B si una pieza falló.

#### Lunes 12 — Entrega

- [ ] Ver el video. Arreglo mínimo. Entregar.

---

## 10. Planes B (si algo falla)

| Si falla... | Hacemos esto |
|---|---|
| Leer Credly desde el servidor | Usar un JSON guardado de una insignia real y decirlo en el código |
| Faucet de Sepolia no da ETH | Probar otro faucet; pedir a un compañero que ya tenga |
| Login con Google | Dejar solo correo |
| Vercel | Grabar el video en `localhost` |
| Rangos | Mostrar todas las insignias sin rango |

**Regla del video:** si una pieza falla el domingo, se graba con el plan B. El video vende la idea, no tiene que ser producción.

---

## 11. Insignia de prueba

Necesitamos al menos una insignia real de Credly para probar. Opciones gratis:
- **AWS Educate — Introduction to Cloud 101** (pocas horas).
- **IBM SkillsBuild** — cursos cortos con insignia.
- **Cisco Networking Academy — Introduction to Cybersecurity** (unas 6 horas).

Lo ideal: que al menos 2 del equipo saquen una, para probar la comparación de nombres con dos personas distintas.

**No crear insignias falsas ni páginas que imiten a Credly.**

---

## 12. Guion del video (borrador)

Dueño en modo solo: **Danny** (guion, grabación, edición, voz).

1. **Problema (15 s):** "¿Cómo sabés que ese AWS en el CV es real?"
2. **Kredian (10 s):** qué es, en una frase.
3. **Demo (60–90 s):** entrar → pegar link → ver insignia verificada → sello en Sepolia → perfil público → "Comprobar sello".
4. **Por qué blockchain (15 s):** testigo neutral, nadie lo puede alterar.
5. **Futuro (15 s):** universidades de Costa Rica, más fuentes, prueba de habilidad.
6. **Cierre (5 s):** logo y nombre.

---

## 13. Cómo seguir con Cursor (Danny)

1. Git Bash, repo en `/c/Users/Danny/code/kredian` (rutas con `/`, no `\`).
2. `git checkout main` y `git pull origin main` cuando haya merge.
3. Rama `danny/...` o la que abra el agente.
4. `npm run dev` → http://localhost:3000
5. Chat nuevo: pegá el prompt **Modo solo** de la sección 15 y la tarea del día (jueves login, viernes flujo, sábado pulido).

Si un compañero aparece: que clone `main` y avise. No se le espera.

---

## 14. Registro de decisiones

| Fecha | Decisión |
|---|---|
| 6 oct | Se cambia de "plataforma emisora" a "verificador de credenciales existentes". |
| 6 oct | Una sola fuente para el MVP: Credly. |
| 6 oct | Se quita emisor, CSV, sal, llaves y Resend. |
| 6 oct | Nombre del proyecto: Kredian. |
| 6 oct | Entrega: video vendiendo el producto. |
| 6 oct | Roles (histórico): José = login; Juliana = sello; Daniel = diseño; Danny = Credly. |
| 8 oct | Modo solo: Danny + Cursor entregan el MVP. No se espera código del resto. |

---

## 15. Guía para Cursor

### Modo solo (usar este)

Reglas:

- Leé `PROYECTO.md` completo. Es la única fuente de verdad.
- Programá **todo** el MVP (login, tablas, Credly, sello, pantallas, diseño usable). No esperes a José, Juliana ni Daniel.
- Seguí el orden de la sección 9 (plan solo). No empieces el sello si todavía no hay `/login` y `profiles`.
- Stack: Next.js App Router + TypeScript + Tailwind + Supabase + ethers.js v6.
- UI en español. Explicá en español, nivel medio.
- No inventes emisores, CSV, Resend, login con Apple, ni otras fuentes además de Credly.
- No commitees `.env.local` ni llaves.
- Contrato y orden de claves del hash: sección 7, sin cambios.
- Lo que Danny tiene que clickear (Supabase, Remix, keys) dejalo en un SQL/`README` corto o instrucciones, no lo simules con secretos inventados.

**Prompt para pegar:**

```
Leé PROYECTO.md completo. Modo solo (secciones 4, 9 y 15).
Soy Danny. No esperes al resto del equipo. Construí el MVP entero
en el orden del plan solo: jueves login+tablas, viernes flujo
Credly→validar→sellar→perfil público, sábado pulido, domingo video.
Stack: Next.js App Router + TypeScript + Tailwind + Supabase + ethers.js v6.
UI en español. No inventes nada que no esté en PROYECTO.md.
No commitees .env.local.
Mi tarea de hoy es: [ESCRIBÍ ACÁ, ej. SQL de tablas + /login + /perfil]
```

---

### Si un compañero aparece (histórico, no bloquea)

---

### José — Login y Supabase

**Tu trabajo:** que alguien pueda entrar (Google o correo), tener fila en `profiles`, editar perfil y que exista `/u/[usuario]` público.

**Archivos que sí podés crear/editar:** cliente de Supabase, middleware de sesión, `src/app/login/`, `src/app/perfil/` (datos, no el look final), `src/app/u/[usuario]/` (datos), SQL/migraciones de las 3 tablas, RLS.

**No hagas:** contrato Solidity, `/api/sellar`, `/api/credly`, rediseñar la home, el video.

**Orden sugerido**
1. Proyecto Supabase `kredian`. Copiá URL y anon key a `.env.local`. Mandáselas a Danny por privado.
2. Tablas `profiles`, `credenciales`, `rangos` (sección 6) + RLS.
3. Auth: correo y Google.
4. `/login`. Al entrar, crear fila en `profiles` si no existe.
5. `/perfil` editable (nombre, foto, descripción). Dejá un hueco visible para "pegar link de Credly" (eso lo conecta Danny).
6. `/u/[usuario]` leyendo `profiles` + `credenciales`.
7. Sábado: publicar en Vercel (plan B: video en localhost).

**Prompt para pegar en Cursor:**

```
Leé PROYECTO.md completo (secciones 2, 4, 6, 8 y 15 — José).
Soy José. Rama jose/...
Hago login y base de datos con Supabase: tablas, RLS, Auth (correo + Google),
rutas /login, /perfil y /u/[usuario].
NO toques contrato, sello, Credly ni el diseño visual de la home.
Stack: Next.js App Router + TypeScript + Tailwind + Supabase.
UI en español. Cambios chicos. Si algo no está en PROYECTO.md, preguntame.
Mi tarea de hoy es: [ESCRIBÍ ACÁ, ej. crear las 3 tablas y /login]
```

---

### Juliana — Contrato y sello

**Tu trabajo:** contrato mínimo en Sepolia y las APIs que sellan y comprueban el hash. Después el botón "Comprobar sello" y el link a Etherscan.

**Archivos que sí podés crear/editar:** copia del contrato (solo el de la sección 7), `src/app/api/sellar/`, `src/app/api/comprobar/`, helper de ethers.js v6, el botón de comprobar en el perfil público cuando esa página exista.

**No hagas:** Supabase, login, lector de Credly, diseño de `/`.

**Orden sugerido**
1. MetaMask, wallet nueva de pruebas, ETH de Sepolia, URL RPC (Alchemy o Infura).
2. Remix: pegar el contrato de la sección 7, desplegar en Sepolia, mandar address a Danny.
3. Poner `SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY` y `KREDIAN_CONTRACT_ADDRESS` en `.env.local` (nunca al repo).
4. `/api/sellar`: arma el objeto de la sección 7, hash sha256, `sellar(bytes32)`, devolver `hash` + `tx_hash`.
5. `/api/comprobar`: recalcular hash y leer `selladoEn` en el contrato.
6. Botón "Comprobar sello" + link a Etherscan (`https://sepolia.etherscan.io/tx/{tx_hash}`).
7. Probar 3 sellos seguidos sin fallos.

**Prompt para pegar en Cursor:**

```
Leé PROYECTO.md completo (secciones 2, 4, 7, 8 y 15 — Juliana).
Soy Juliana. Rama juliana/...
Hago el sello en Sepolia: contrato mínimo de la sección 7 (Remix),
ethers.js v6, rutas /api/sellar y /api/comprobar, botón Comprobar sello
y link a Etherscan. La firma va SOLO en el servidor.
NO toques login, Supabase, Credly ni el diseño de pantallas.
NO cambies el contrato ni el orden de las claves del hash.
Stack: Next.js App Router + TypeScript + Tailwind + ethers.js v6.
UI en español. Cambios chicos. Si algo no está en PROYECTO.md, preguntame.
Mi tarea de hoy es: [ESCRIBÍ ACÁ, ej. desplegar el contrato y /api/sellar]
```

---

### Daniel — Diseño y video

**Tu trabajo:** que se vea como producto. Home, tarjetas, rangos, pulir `/perfil` y `/u/[usuario]`, guion y video.

**Archivos que sí podés crear/editar:** `src/app/page.tsx`, `src/app/globals.css`, componentes visuales (tarjeta de credencial, insignias Bronce/Plata/Oro/Platino), estilos de `/login`, `/perfil` y `/u/[usuario]` **sin cambiar** la lógica de login/sello/Credly.

**No hagas:** tablas, Auth, contrato, APIs.

**Orden sugerido**
1. 3 referencias visuales + 2 colores + logo sencillo. Pasalo al grupo.
2. Diseñar `/` (ya hay texto base y botón Entrar → `/login`).
3. Componente de tarjeta de credencial + 4 insignias de rango.
4. Aplicar el look a `/perfil` y `/u/[usuario]` cuando existan.
5. Estados de carga y errores.
6. Guion (sección 12), grabar demo, editar video.

**Prompt para pegar en Cursor:**

```
Leé PROYECTO.md completo (secciones 1, 2, 4, 8, 12 y 15 — Daniel).
Soy Daniel. Rama daniel/...
Hago diseño UI en español con Tailwind: home /, tarjetas de credencial,
insignias de rango (bronce, plata, oro, platino) y el look de /perfil y
/u/[usuario]. También el guion del video (sección 12).
NO toques Supabase, login, contrato, ni las APIs de Credly/sello.
No cambies el texto de qué es Kredian (sección 1) salvo para acortarlo.
Stack: Next.js App Router + TypeScript + Tailwind.
Cambios chicos. Si algo no está en PROYECTO.md, preguntame.
Mi tarea de hoy es: [ESCRIBÍ ACÁ, ej. diseñar la home /]
```

---

### Danny — Credly e integración

**Tu trabajo:** leer Credly, comparar nombres, llenar rangos, juntar PRs en `main`, conectar pegar-link → leer → validar → sellar → guardar.

**Archivos que sí podés crear/editar:** `src/app/api/credly/`, utilidad de comparar nombres, seed/uso de `rangos`, el pegado de link en `/perfil` cuando José ya tenga la pantalla, este `PROYECTO.md`.

**No hagas:** reescribir login, contrato o el diseño de Daniel. Integra.

**Orden sugerido**
1. Invitar al equipo al repo. Avisar "ya pueden clonar".
2. Insignia real de Credly (sección 11).
3. Probar fetch de la página pública. Si no se puede: JSON de ejemplo (plan B).
4. `/api/credly` + comparación de nombres (sin tildes, sin mayúsculas).
5. Mergear PRs (squash). Conectar el flujo el viernes.
6. Tabla `rangos` (~20) y asignar rango al guardar.
7. Voz del pitch el domingo.

**Prompt para pegar en Cursor:**

```
Leé PROYECTO.md completo (secciones 2, 4, 6, 10, 11 y 15 — Danny).
Soy Danny. Rama danny/... (o la que esté usando el agente).
Hago el lector de Credly, la comparación de nombres, la tabla de rangos
y juntar las piezas en main. Soy el único que mergea a main.
NO construyas login, contrato ni un diseño nuevo de la home.
NO inventes emisores, CSV, Resend ni otras fuentes.
Stack: Next.js App Router + TypeScript + Tailwind.
UI en español. Cambios chicos. Si algo no está en PROYECTO.md, preguntame.
Mi tarea de hoy es: [ESCRIBÍ ACÁ]
```
