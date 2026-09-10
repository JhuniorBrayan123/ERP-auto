# Troubleshooting y Reportes

## 📊 8 — Reportes — ¿Qué información obtengo?

Después de cada ejecución, el proyecto genera **6 tipos de reportes** que informan al equipo QA sobre el estado del proyecto:

### Reporte HTML (nativo de Playwright)

```bash
npx playwright show-report
```

**Qué muestra:**
- 📋 Lista completa de tests ejecutados con estado (✅ passed / ❌ failed / ⏭️ skipped)
- 📸 **Screenshot** de cada paso del test — ves exactamente qué mostraba la UI
- 🎥 **Video** de la ejecución completa — reproduce paso a paso dónde se rompió
- 🔍 **Trace** interactivo — viaja en el tiempo: ve el DOM, la red, las acciones de cada momento
- ⏱️ **Duración** de cada test — identifica cuáles son los más lentos
- 📊 **Resumen** al inicio: total, passed, failed, flaky, skipped

**Cuándo usarlo:** Para investigar cualquier fallo. Es el reporte más completo.

---

### Resumen Maven (consola)

```bash
npm run report:summary
```

**Qué muestra:**
- Tabla estilo Maven/Surefire con resultados en consola
- Total de tests, passed, failed, skipped
- Lista de tests fallidos con su duración
- Ideal para revisión rápida sin abrir navegador

**Cuándo usarlo:** Cuando necesitas un vistazo rápido desde la terminal o para logs de CI/CD.

---

### Allure (reporte visual avanzado)

```bash
npx allure serve allure-results
```

**Qué muestra:**
- Dashboard visual con gráficos de tendencias
- Historial de ejecuciones (si se acumulan resultados)
- Categorización de fallos
- Attachments: screenshots, videos, logs
- Filtros por severidad, suite, paquete

**Cuándo usarlo:** Para presentaciones al equipo o análisis de tendencias a lo largo del tiempo.

---

### JUnit XML

- **Ubicación:** `test-results/results.xml`
- **Uso:** Integración con CI/CD (Jenkins, GitLab CI, GitHub Actions)
- **Qué contiene:** Resultados estructurados en formato estándar JUnit

---

### JSON

- **Ubicación:** `test-results/<proyecto>/results.json` — el runner setea `PW_REPORT_OUTPUT` por proyecto
  (`test-results/puntoventa/results.json`, `test-results/facturacion/results.json`, `test-results/logistica/results.json`, `test-results/clientes/results.json`)
- **Uso:** Procesamiento programático e integración con herramientas externas; `scripts/analyze-results.ts` lo
  parsea para listar los tests fallidos por proyecto
- **Path por defecto (sin el env):** `test-results/results.json` — no rompe si corres Playwright directo

---

### Discord Reporter (resumen automático en Discord)

Envía un resumen consolidado de la corrida al canal del equipo: desglose por módulo, metadata
(entorno, tester, duración, commit/branch), detalle funcional de los fallos, menciones y link al
reporte HTML. **Un solo mensaje por corrida Run All.**

> ⚠️ **Sin secretos en el repo:** el webhook y tu identidad viven SOLO en tu
> `config/environment.env` local (gitignored). Nunca pegues el URL del webhook en código ni en este README.

#### Cómo activarlo (setup por persona)

1. Edita tu `config/environment.env` local (fuera de git) y descompleta:

```bash
DISCORD_REPORT_ENABLED=1        # gate: apagado por defecto
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token>   # TU webhook (secreto)
DISCORD_TESTER_NAME=TuNombre     # quién corrió la prueba
DISCORD_USER_ID=123456789        # tu ID de usuario → te menciona en fallos
```

2. (Opcional) Modos de envío:

```bash
DISCORD_ONLY_FAILURES=1   # solo envía si hubo fallos (corrida verde → silencio)
DISCORD_DRY_RUN=1         # no postea: muestra el mensaje en consola (probar sin ensuciar el canal)
```

#### Comportamiento

- **Run All (secuencial):** cada proyecto escribe un parcial y el runner consolida **UN** mensaje con
  desglose por módulo. Si un proyecto crashea sin escribir su parcial, el reporte igual se envía con un
  aviso del faltante.
- **Run All (terminales separadas):** no consolida — cada terminal envía su propio mensaje directo. Usá
  Run All secuencial si querés el mensaje único.
- **Proyecto individual:** envía directo al terminar la corrida.
- **Sin webhook configurado:** avisa en consola y no bloquea la corrida.

#### Regenerar el webhook

El webhook anterior quedó filtrado en el historial de git. **Creá uno nuevo**: Discord → Ajustes del
canal → Integraciones → Webhooks → *Nuevo webhook*, copiá el URL a tu `config/environment.env` y no lo
compartas en el repo.

---

### Cómo ver el trace de un test fallido

```bash
# 1. Corre el test (el trace se guarda automáticamente en fallos)
npx playwright test --grep "@MS-1"

# 2. Abre el reporte HTML
npx playwright show-report

# 3. Haz clic en el test fallido → en la sección "Traces" → abre el archivo .zip
#    O directamente:
npx playwright show-trace test-results/<carpeta-del-test>/trace.zip
```

---

## 🔥 9 — ¿Qué hago si falla un test?

Sigue este flujo de diagnóstico:

```
¿Falló el test?
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 1 — ¿Es un problema de AMBIENTE?                   │
│  ⚠️  Health checks aún no configurados.                 │
│     Sáltate este paso por ahora e inicia en el Paso 2.   │
│                                                          │
│  (Cuando estén listos, el comando será:)                 │
│  npx playwright test tests/health/ --project=chromium    │
│                                                          │
│  ✅ Todos OK → ve al Paso 2                              │
│  ❌ Alguno falla → el ambiente está caído, avisa al equipo│
│     PRD  → https://app.smartclic.pe/                     │
│     CRT  → https://erpperu2-crt.smartclic.pe/            │
│     CRT-2 → https://erpperu2-crt-2.smartclic.pe/         │
│     CRT-3 → https://erpperu2-crt-3.smartclic.pe/         │
│     CRT-4 → https://erpperu2-crt-4.smartclic.pe/         │
└──────────────────────────────────────────────────────────┘
       │ (por ahora, empieza aquí)
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 2 — ¿Es un problema de DATOS?                      │
│  Vuelve a correr los setup projects:                     │
│  npx playwright test --project=pv-datos-setup            │
│  npx playwright test --project=pv-items-setup            │
│  npx playwright test --project=datos-setup               │
│                                                          │
│  Los setups son idempotentes (seguros de re-ejecutar).   │
│  Si el test pasa ahora → eran datos faltantes.           │
│  Si sigue fallando → ve al Paso 3.                       │
└──────────────────────────────────────────────────────────┘
       │ (datos OK)
       ▼
┌──────────────────────────────────────────────────────────┐
│  PASO 3 — ¿Es un problema del SCRIPT?                    │
│  Abre el reporte HTML:                                   │
│  npx playwright show-report                              │
│                                                          │
│  Revisa en el test fallido:                              │
│  • 📸 Screenshot → ¿qué mostraba la UI en el fallo?     │
│  • 🎥 Video → ¿en qué paso exacto se rompió?            │
│  • 🔍 Trace → npx playwright show-trace <archivo.zip>   │
│                                                          │
│  Causas comunes:                                         │
│  - Selector desactualizado (cambió algo en la UI)        │
│  - Timeout (la página tardó más de lo esperado)          │
│  - Credenciales vencidas en config/environment.env       │
└──────────────────────────────────────────────────────────┘
```

---

### Mensajes de error comunes y qué significan

| Mensaje                                                     | Causa probable                               | Solución                                                                 |
|:------------------------------------------------------------|:---------------------------------------------|:-------------------------------------------------------------------------|
| `Error: Falta la variable de entorno: APP_ENV`              | No existe `config/environment.env`           | Crea el archivo con `APP_ENV`, `USER_EMAIL` y `USER_PASSWORD`            |
| `Error: Falta la variable de entorno: USER_EMAIL`           | El `.env` está incompleto                    | Agrega las variables faltantes al archivo                                |
| `Timeout 240000ms exceeded`                                 | La app no respondió o el ambiente está lento | Verifica manualmente que el entorno (`APP_ENV`) responde en el navegador |
| `storageState: "playwright/.auth/user.json" does not exist` | La sesión no fue generada                    | Corre `npx playwright test --project=setup`                              |
| `Locator not found` / `strict mode violation`               | Un selector cambió en la UI                  | Revisar trace → el paso fallido muestra el elemento                      |
| `expect(received).toBe(expected)` en stock o kardex         | Los datos del ambiente no coinciden          | Re-ejecuta los setup projects                                            |
| `net::ERR_NAME_NOT_RESOLVED`                                | URL de entorno incorrecta o sin red          | Verifica `APP_ENV` en `environment.env`                                  |
| `[movimiento-data] dynamic-items.json no encontrado`        | El archivo de ítems dinámicos no existe      | Ejecuta el setup de ítems primero: `npx playwright test --project=pv-items-setup` |

---

## ❓ 13 — Preguntas frecuentes

**¿Puedo correr los tests mientras otro compañero los está corriendo?**
Sí, si apuntan a entornos distintos (`APP_ENV=crt` vs `APP_ENV=crt-2`). En el mismo entorno puede haber conflictos de
datos.

**¿Los setup projects borran datos existentes?**
No. Usan el patrón "Find or Create": si el dato ya existe, lo omiten. Son seguros de ejecutar N veces.

**¿Por qué el test de Login está vacío?**
El login automatizado ya existe en `auth.setup.ts` y se ejecuta automáticamente. El archivo `Login/Login.spec.ts` está
pendiente de implementar una suite de regresión de login (casos negativos, validaciones de error, etc.).

**¿Cómo agrego un test nuevo?**
Sigue la convención `<ID>-<descripcion>.spec.ts` en la carpeta del módulo correspondiente. Mira cualquier spec existente
como referencia de estructura.

**¿Dónde están los screenshots y videos de ejecución?**
En la carpeta `test-results/` y visibles en `npx playwright show-report`.

---

*Última actualización: Junio 2026 — Equipo QA Automatización ERP Perú 2*

