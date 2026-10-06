# Kredian — PROYECTO.md

> **Este archivo es la única fuente de verdad del proyecto.**
> Si algo no está aquí, no está decidido. Si el PDF viejo o un chat dicen otra cosa, manda este archivo.
> Cursor y cualquier IA deben leer este archivo completo antes de escribir código.
> Solo Danny edita este archivo. Si querés cambiar algo, pedilo en el grupo.

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

## 4. Equipo y roles

| Persona | Nombre | Rol | Dueño de |
|---|---|---|---|
| 1 | José Daniel | Frontend y video | Pantallas, diseño, insignias de rango, edición del video |
| 2 | Juliana | Base de datos y login | Supabase, tablas, login, perfil editable |
| 3 | Daniel Corrales | Web3 | Contrato, wallet, sello en Sepolia, "Comprobar sello" |
| 4 | Danny | Líder e integración | Lector de Credly, validación, este archivo, juntar todo en `main` |

---

## 5. Reglas de trabajo (para que nada se caiga a pedazos)

1. **Nadie trabaja en `main`.** Cada quien usa su rama: `jose/...`, `juliana/...`, `daniel/...`, `danny/...`.
2. **Solo Danny junta ramas en `main`** (Pull Request en GitHub).
3. **Pedazos chiquitos.** Un Pull Request = una cosa. Mejor 5 PR chiquitos que 1 gigante.
4. **Antes de pedirle algo a Cursor**, decile: "Leé PROYECTO.md primero".
5. **Si Cursor propone algo que no está en este archivo, decile que no.**
6. **Llaves secretas nunca van al repo.** Van en `.env.local`, que está en `.gitignore`. Se comparten por mensaje privado.
7. **La wallet es solo de pruebas.** Nunca le metan dinero real.
8. **Cada noche**, en el grupo: qué hice, qué me trabó, qué hago mañana. Una línea cada cosa.
9. **Si algo te traba más de 1 hora, avisá.** No te quedés pegado solo.

---

## 6. Datos (tablas en Supabase)

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

| Ruta | Qué muestra | Quién la ve |
|---|---|---|
| `/` | Inicio: qué es Kredian, botón "Entrar" | todos |
| `/login` | Google o correo | todos |
| `/perfil` | Editar perfil + pegar link + mis credenciales | dueño |
| `/u/[usuario]` | Perfil público con insignias y "Comprobar sello" | todos, sin cuenta |
| `/rangos` | Tabla de rangos (solo si sobra tiempo) | todos |

### Variables de entorno (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
KREDIAN_CONTRACT_ADDRESS=
```

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
- [ ] Crear el repo `kredian` en GitHub.
- [ ] Invitar a los otros 3.
- [ ] Subir este `PROYECTO.md`.
- [ ] Inscribirse en un curso gratis con insignia de Credly (ver sección 11).

**Juliana**
- [ ] Crear cuenta en Supabase.
- [ ] Crear el proyecto `kredian`.
- [ ] Mandar URL y anon key a Danny por privado.

**Daniel Corrales**
- [ ] Instalar MetaMask en el navegador.
- [ ] Crear una wallet **nueva** solo para Kredian.
- [ ] Conseguir ETH de prueba de Sepolia en un faucet.
- [ ] Crear cuenta gratis en Alchemy o Infura y sacar la URL RPC de Sepolia.

**José Daniel**
- [ ] Buscar 3 webs que le gusten como referencia visual.
- [ ] Proponer 2 colores principales y un logo sencillo para Kredian.

### Miércoles 7 — Base del proyecto
**Danny**
- [ ] Con Cursor, crear el proyecto Next.js + TypeScript + Tailwind.
- [ ] Crear `.gitignore` con `.env.local`.
- [ ] Subir a `main`.
- [ ] Avisar en el grupo: "ya pueden clonar".

**Todos**
- [ ] Clonar el repo.
- [ ] Crear su rama.
- [ ] Correr `npm install` y `npm run dev`.
- [ ] Confirmar que ven la página en `localhost:3000`.

**Juliana**
- [ ] Crear las 3 tablas de la sección 6.
- [ ] Activar login con correo.
- [ ] Activar login con Google.

**Daniel Corrales**
- [ ] Abrir Remix (remix.ethereum.org).
- [ ] Pegar el contrato de la sección 7.
- [ ] Desplegarlo en Sepolia con MetaMask.
- [ ] Guardar la dirección del contrato y mandarla a Danny.

**Danny**
- [ ] Probar si la página pública de la insignia de Credly se puede leer desde el servidor.
- [ ] Si no se puede, guardar un JSON de ejemplo como plan B (sección 10).

**José Daniel**
- [ ] Diseñar la pantalla `/` (inicio).

### Jueves 8 — Cada pieza funciona sola
**Juliana**
- [ ] Pantalla `/login` funcionando.
- [ ] Al entrar, crear la fila en `profiles`.
- [ ] Pantalla `/perfil` con nombre, foto y descripción editables.

**Danny**
- [ ] Ruta API `/api/credly` que recibe un link y devuelve los datos de la insignia.
- [ ] Función que compara nombres (sin tildes, sin mayúsculas).

**Daniel Corrales**
- [ ] Ruta API `/api/sellar` que recibe datos, calcula el hash y lo manda al contrato.
- [ ] Ruta API `/api/comprobar` que recalcula y busca el hash en el contrato.

**José Daniel**
- [ ] Componente de tarjeta de credencial.
- [ ] 4 insignias de rango (Bronce, Plata, Oro, Platino).

### Viernes 9 — Juntar todo
**Danny**
- [ ] Juntar las ramas en `main`.
- [ ] Conectar: pegar link → leer → validar → sellar → guardar.

**Juliana**
- [ ] Pantalla pública `/u/[usuario]`.
- [ ] Revisar permisos RLS.

**Daniel Corrales**
- [ ] Botón "Comprobar sello" en el perfil público.
- [ ] Link a Etherscan por cada credencial.

**José Daniel**
- [ ] Aplicar diseño a `/perfil` y `/u/[usuario]`.
- [ ] Escribir el guion del video (sección 12).

**Todos**
- [ ] Probar el flujo completo al menos una vez.

### Sábado 10 — Rangos y pulido
- [ ] Danny: llenar la tabla `rangos` con ~20 certificaciones.
- [ ] Danny: asignar rango al guardar una credencial.
- [ ] Juliana: publicar en Vercel.
- [ ] José Daniel: estados de carga y mensajes de error bonitos.
- [ ] Daniel Corrales: probar el sello 3 veces seguidas sin fallos.
- [ ] Todos: anotar errores en el grupo.

### Domingo 11 — Video
- [ ] Todos: congelar código a mediodía. Después solo se arreglan errores.
- [ ] José Daniel: grabar pantalla del flujo completo.
- [ ] Danny: grabar o escribir la voz del pitch.
- [ ] José Daniel: editar el video.

### Lunes 12 — Entrega
- [ ] Ver el video completo entre todos.
- [ ] Corregir lo último.
- [ ] Entregar.

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

1. **Problema (15 s):** "¿Cómo sabés que ese AWS en el CV es real?"
2. **Kredian (10 s):** qué es, en una frase.
3. **Demo (60–90 s):** entrar → pegar link → ver insignia verificada → sello en Sepolia → perfil público → "Comprobar sello".
4. **Por qué blockchain (15 s):** testigo neutral, nadie lo puede alterar.
5. **Futuro (15 s):** universidades de Costa Rica, más fuentes, prueba de habilidad.
6. **Cierre (5 s):** logo y nombre.

---

## 13. Prompt de contexto para Cursor

Pegar esto al abrir un chat nuevo en Cursor:

```
Leé el archivo PROYECTO.md completo antes de hacer nada. Es la única fuente de verdad.
Estamos construyendo Kredian: una web que lee insignias públicas de Credly, valida
que el nombre coincida con el perfil y sella un hash en Sepolia.
Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase + ethers.js v6.
NO construyas nada de emisores, CSV, sal, llaves por correo, Resend ni login con Apple.
Si algo no está en PROYECTO.md, preguntame antes de inventarlo.
Hacé cambios pequeños y explicame cada paso en español sencillo, porque no tengo
experiencia programando.
Mi tarea de hoy es: [ESCRIBÍ AQUÍ TU TAREA]
```

---

## 14. Registro de decisiones

| Fecha | Decisión |
|---|---|
| 6 oct | Se cambia de "plataforma emisora" a "verificador de credenciales existentes". |
| 6 oct | Una sola fuente para el MVP: Credly. |
| 6 oct | Se quita emisor, CSV, sal, llaves y Resend. |
| 6 oct | Nombre del proyecto: Kredian. |
| 6 oct | Entrega: video vendiendo el producto. |
