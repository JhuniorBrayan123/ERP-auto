# MCP BookStack (vendored)

Servidor MCP local para consultar y documentar en **BookStack** (fuente de la verdad del
agente QA). Está versionado dentro de este repo para que todo el equipo lo use igual.

## Setup (una sola vez por máquina)

```bash
npm install
npm run build
```

Esto genera `dist/` (ignorado por git). El MCP se registra en `opencode.json`
con ruta relativa: `node tools/mcp-bookstack/dist/index.js`.

## Credenciales

**NO** se commitean. OpenCode inyecta las variables `BOOKSTACK_*` desde el `.env`
de la **raíz del proyecto** (`opencode.json` usa `{env:BOOKSTACK_BASE_URL}`, etc.).

Si quieres probar el servidor manualmente, copia `.env.example` como `.env` local
en esta carpeta con tus credenciales:

```
BOOKSTACK_BASE_URL=https://tu-bookstack.com
BOOKSTACK_TOKEN_ID=tu_token_id
BOOKSTACK_TOKEN_SECRET=tu_token_secret
```

> El token de BookStack se crea en **Admin > API Tokens**. Verifica que el
> `TOKEN_ID` tenga todos sus caracteres (incluye el `0` inicial si existe).

## Uso

- `npm run dev` — ejecuta el servidor en modo desarrollo (`tsx`)
- `npm run build` — compila TypeScript a `dist/`
- `npm start` — ejecuta el servidor compilado

## Tools expuestas

- `bookstack_list_books` / `bookstack_list_chapters`
- `bookstack_search` / `bookstack_get_page`
- `bookstack_create_page` / `bookstack_update_page` (dryRun por defecto)
