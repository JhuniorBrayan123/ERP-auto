# MCP GitLab (vendored)

Servidor MCP local para leer y operar **GitLab** (MRs, diffs, pipelines, archivos del
repositorio). Está versionado dentro de este repo para que todo el equipo lo use igual.

## Setup (una sola vez por máquina)

Requisito: **Python 3.10+** y `pip`.

```bash
cd tools/mcp-gitlab
pip install -r requirements.txt
```

## Credenciales

**NO** se commitean. El server carga las variables `GITLAB_*` desde el `.env`
de la **raíz del proyecto** (usa `load_dotenv()` con el cwd y un fallback a un
`.env` propio en esta carpeta).

Si quieres probar el servidor manualmente, copia `.env.example` como `.env` local
en esta carpeta con tus credenciales:

```
GITLAB_URL=https://gitlab.sreasons.com
GITLAB_TOKEN=tu_token_personal
```

> El token se crea en **GitLab > Settings > Access Tokens**. Para operaciones de
> escritura (crear/aprobar MRs) requiere scope `api`; para solo lectura alcanza
> `read_api`.

## Uso

- `python server.py` — ejecuta el servidor en modo stdio (lo usa OpenCode)
- Verificación rápida: el MCP aparece en `opencode.json` como `gitlab`

## Tools expuestas

- `search_projects` / `get_repository_tree` / `get_file_content` (lectura)
- `list_merge_requests` / `get_merge_request` / `get_merge_request_diff`
- `get_merge_request_comments` / `get_merge_request_pipelines` / `get_conflicting_files`
- `create_merge_request` / `update_merge_request` / `approve_merge_request` (escritura, con guardas)
