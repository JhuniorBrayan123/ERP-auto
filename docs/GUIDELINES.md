# Convenciones y Estándares

## 🔐 10 — Variables de entorno

La gestión de configuración ocurre centralizada en `config/env.ts` que lee desde `config/environment.env`.

| Variable               | Para qué sirve                                                                | Valores posibles                         | Obligatoria |
|:-----------------------|:------------------------------------------------------------------------------|:-----------------------------------------|:------------|
| `APP_ENV`              | Define a qué entorno de ERP Perú 2 apuntarán las pruebas.                    | `crt`, `crt-2`, `crt-3`, `crt-4`, `prd` | **Sí**      |
| `USER_EMAIL`           | Correo de la cuenta de pruebas.                                               | Un correo válido del sistema             | **Sí**      |
| `USER_PASSWORD`        | Contraseña del usuario.                                                       | Contraseña válida                        | **Sí**      |
| `BROWSER`              | Sobrescribe el navegador a usar.                                              | `chromium`, `firefox`, `webkit`          | Opcional    |
| `SKIP_PV_SETUP`        | Omite el setup de datos de Punto de Venta (vendedor, campos, clientes).       | `1` para omitir                          | Opcional    |
| `SKIP_PV_ITEMS_SETUP`  | Omite el setup de ítems de Punto de Venta (ISC, ICBPER, Receta, Lista).       | `1` para omitir                          | Opcional    |
| `DISCORD_REPORT_ENABLED` | Gate del reporter de Discord.                                              | `1` para activar; ausente = apagado      | Opcional    |
| `DISCORD_WEBHOOK_URL`  | URL del webhook del canal (secreto local, nunca en git).                     | URL válido                               | Opcional (necesaria si gate=1) |
| `DISCORD_TESTER_NAME`  | Nombre que aparece como tester en el reporte.                                | Texto libre                              | Opcional    |
| `DISCORD_USER_ID`      | Tu ID de usuario Discord → mencionado en fallos.                             | `123` o `<@123>`                         | Opcional    |
| `DISCORD_ONLY_FAILURES`| Solo enviar el reporte si hubo fallos.                                       | `1`                                      | Opcional    |
| `DISCORD_DRY_RUN`      | No postear: muestra el mensaje en consola (prueba segura).                   | `1`                                      | Opcional    |

---

## 📐 11 — Convenciones y estándares

A partir de la arquitectura actual se infieren las siguientes reglas:

- **Nomenclatura de archivos:** Sigue el patrón `<IdTicket>-<descripcion-corta>.spec.ts`. Ejemplo:
  `PS-6-edicion-masiva-servicios.spec.ts`.
- **Nomenclatura de clases POM:** Sigue `PascalCase` terminando en la palabra `Page`. Ejemplo: `KardexVerificacionPage`,
  `RegistroMovimientoPage`.
- **Nomenclatura de helpers:** Funciones exportadas en `camelCase` describiendo acciones. Ejemplo:
  `verificarStockYKardex`, `definirAlmacenYMotivo`.
- **Nomenclatura Screenplay (PuntoVenta):**
  - *Tasks:* `PascalCase` terminando en `.task.ts`. Ejemplo: `BuscarYAgregarItemSimple.task.ts`.
  - *Questions:* `PascalCase` que describen qué observan. Ejemplo: `TotalDeVenta`, `MensajeVisible`.
  - *Interactions:* `PascalCase` que describen la acción atómica. Ejemplo: `AbrirTotales`, `CerrarTotales`.
  - *Actor:* `Cajero` — usa `intentaRealizar()` para ejecutar tasks/questions.
- **Estructura de un test:** Todo el flujo se envuelve en `test.step()` de manera declarativa indicando intención de
  negocio (Given/When/Then o And). Ejemplo: `await test.step('And: abrir datos opcionales...', async () => {...})`.
- **Patrón AAA (Arrange, Act, Assert):** Especialmente notable al integrar API. Ejemplo:
    - *Arrange:* `await test.step('API kardex: antes...', async () => { saldoAfectadoApi = ... })`
    - *Act:* Acciones sobre la UI para realizar un movimiento de almacén.
    - *Assert:*
      `await test.step('Assert API: verificar kardex en DB', async () => { expect(saldoPosIngreso).toBe(saldoAfectadoApi + 150) })`.
- **Setup Projects (Find or Create):** Para datos base, usar el patrón idempotente: buscar por código/nombre en la UI,
  si existe → skip, si no → crear. Nunca hardcodear datos que deban existir previamente.
- **Uso de Helpers (Granular vs Alto nivel):**
    - *Helpers de Alto nivel:* Encapsulan varios pasos de una misma vista (`navegarAIngresosYNuevo`). Útiles para
      agilizar el Arrange.
    - *Helpers Granulares:* Realizan validaciones o clics específicos que se repiten con variaciones menores en
      diferentes flujos (`buscarYSeleccionarItem`).
- **Precios dinámicos:** Nunca hardcodear valores monetarios en tests. Usar `calcularTotalesDeItem('KEY')` desde
  `@utils/precio-item.helper` para obtener subtotal, IGV y total desde el factory.
- **Códigos dinámicos:** Los ítems creados por el setup tienen sufijo RUN_ID. En tests, usar siempre
  `ITEMS_PV.XXX.codigo` y `ITEMS_TEST.XXX.codigo` (que resuelven al código dinámico), nunca strings hardcodeados.

---

