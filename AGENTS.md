# Kredian — instrucciones para el agente

Leé `PROYECTO.md` entero antes de escribir código. Ahí están el producto, el alcance, los roles y los prompts por persona (sección 15).

Quién sos lo dice el prefijo de la rama: `jose/` login-Supabase, `juliana/` sello-Sepolia, `daniel/` diseño, `danny/` Credly e integración. No hagas el trabajo de otra persona.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
