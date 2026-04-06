# 📘 Documentación Técnica: Proyecto de Automatización ERP Perú 2

> [!NOTE]
> **Propósito de este documento:** Proveer una visión general, técnica y de negocio, sobre cómo está construido el framework de automatización E2E del proyecto ERP usando Playwright. Diseñado para alinear a equipos de QA, Desarrolladores y Liderazgo Técnico.

---

## 1. Resumen Ejecutivo
**ERP Perú 2 Automation** es un framework de pruebas End-to-End (E2E) moderno construido sobre **Playwright y TypeScript**. El proyecto tiene como objetivo asegurar la calidad de los flujos críticos (Login, Logística, Creación e Inventario de Items) en distintos entornos (`QA`, `PRD`). 

Para evitar cuellos de botella y "flakiness" (inestabilidad de datos), el framework sacrifica la paralelización total para asegurar consistencia en las pruebas de creación o modificación masiva de inventario, utilizando una arquitectura **Page Object Model (POM)** combinada con autenticación por estado guardado y fixtures personalizados.

---

## 2. Arquitectura del Proyecto
El proyecto está estructurado estratégicamente para escalabilidad y fácil mantenimiento. Sus pilares técnicos son:

*   **Stack Tecnológico:** TypeScript (Node.js) + Playwright Test (`@playwright/test` v1.58+).
*   **Patrón de Diseño:** **Page Object Model (POM)** (Ej: `tests/Logistica/pages/`). Las páginas encapsulan selectores y acciones de UI, separando así la lógica de negocio de la lógica estructural de los archivos `.spec.ts`.
*   **Variables de Entorno (.env):** Manejo inteligente de *environments* a través de `dotenv`, permitiendo cambiar el "contexto" corriendo el test en producción o QA mediante archivos como `.env.qa` y `.env.prd`.
*   **Caché de Autenticación:** Proceso "Global Setup" (vía `auth.setup.ts`) que se loguea una sola vez. Guarda la cookie y token en `playwright/.auth/user.json`.

---

## 3. Flujo de Ejecución de una Prueba
Un test en este framework sigue la metodología **AAA** (Arrange, Act, Assert).

1.  **Arreglar (Arrange):** El `playwright.config.ts` lee la URL base (`BASE_URL`) del archivo `.env`. Se lee la sesión pre-guardada (`user.json`) por lo que el test ya arranca como un usuario logueado.
2.  **Actuar (Act):** El archivo `.spec.ts` invoca a una de las Clases Page *(Ej: `tests/Logistica/pages/ComboFormPage.ts`)*. Se hacen interacciones sobre los componentes (clicks en botones, llenado de Excel u objetos).
3.  **Afirmar (Assert):** Se verifica con los re-intentos automáticos de `expect()` de Playwright *(timeout de 10 segundos)* que el elemento haya sido reflejado correctamente, por ejemplo, que un "Item" aparezca guardado en la grilla.

---

## 4. Explicación de cómo funciona Playwright en este Proyecto
Playwright actúa como el "titiritero" del navegador, con reglas fuertemente acopladas al contexto de un ERP:

*   **Sin Paralelismo para la Estabilidad (Serialización):** Configurado con `fullyParallel: false` y `workers: 1` (`playwright.config.ts:29-30`). En sistemas ERP, la lectura de stocks/costos chocan si multihilos editan los mismos productos al mismo tiempo.
*   **Timeouts Flexibles:** Esperas adaptadas para procesos complejos. Tiempos de acción de 15s y navegación total de 30s (`playwright.config.ts:55`).
*   **Manejo de Borradores:** Existen pruebas generadas automáticamente (`CodeGen`), pero el proyecto restringe su ejecución oficial ignorando `tests/_codegen/` (`testIgnore: ['**/_*']`) porque no utilizan POM y son más frágiles.
*   **Integración CI:** `retries` están programados para correr 2 veces solo si detectan variable de entorno de integraciones continuas, o 0 si corren localmente.

---

## 5. Casos de Negocio Cubiertos
El núcleo de pruebas está situado dentro del directorio `tests/`:

1.  **🔑 Autenticación Central:** `tests/Login/Login.spec.ts` y procesos de inicio global (`auth.setup.ts`).
2.  **📦 Logística (Gestión de Items):** 
    *   Flujos masivos en `tests/Logistica/ActualizacionMasiva/`.
    *   Pruebas detalladas en `tests/Logistica/Items/` como la validación o edición de combos e Insumos (`crear-insumo.spec.ts`).
3.  **🏭 Logística (Movimientos):** Casuística especializada guardada en `tests/Logistica/Movimientos/`.

---

## 6. Fortalezas
*   ✅ **Rapidez de Inicio:** El setup reutiliza el contexto del browser, bajando de 10 a solo 1 segundo la entrada a sesión.
*   ✅ **Trazabilidad de Errores:** Incluye configuración de reportes `.html`, rastreo de video (`retain-on-failure`) y snapshots (`only-on-failure`).
*   ✅ **Limpieza del Código:** Las "Fixtures" e "Helpers" (ej: `tests/Logistica/helpers/nombre-clonado.helper.ts`) remueven el código basura o aleatorio de las pruebas principales. 

---

## 7. Riesgos o Deuda Técnica
> [!WARNING] 
> Oportunidades de mejora en radar:
*   ⏳ **Lentitud Intencional:** Al estar serializadas (`workers: 1`), a medida que los tests de logística crezcan, la corrida total podría tomar demasiado tiempo obligándonos a considerar paralelismo particionado por usuarios o bodegas distintas.
*   🧹 **Código Legado:** Aún tenemos rastro de pruebas generadas automáticamente (codegen en `_codegen`, monolitos puros).
*   🏷️ **Falta de Segmentación (Tags):** No disponemos del mecanismo `--grep` integrado, por lo cual, correr un set "Smoke Test" rápido todavía requiere especificar archivos a mano.

---

## 8. Próximos Pasos
> [!TIP]
> **Roadmap corto:**
1.  Completar el refactor final (eliminación completa de `tests/_codegen`).
2.  Desarrollar nomenclatura de tags en los `.spec.ts` usando anotaciones como `{ tag: '@smoke' }`.
3.  Consumir la estrategia de reportería Junit en `.gitlab-ci.yml` (Actualmente el archivo tiene un `exit 0` configurado provocando salto del pipeline).

---

## 9. Mapa Rápido del Proyecto

| Directorio / Archivo | Función Principal |
| :--- | :--- |
| `playwright.config.ts` | Configuración core (Workers, BaseURLs, Timeouts, setup). |
| `tests/auth.setup.ts` | Login único por corrida. Guarda la semilla en `user.json`. |
| `tests/Logistica/pages/` | Repositorio POM: Selectores modulares y métodos UI. |
| `tests/Logistica/Items/` | Especificaciones (`spec.ts`) validando el flujo real. |
| `tests/Logistica/fixtures/` | Data precargada o flujos pre-listos inyectables (`items-fixture.ts`). |
| `.gitlab-ci.yml` | Base de despliegue/CI. Actualmente pausada. |

---

## 10. Cierre y Presentación
**En conclusión,** la suite de automatización ERP Perú 2 no es un mero "guion de clics", es una solución estandarizada de testing orientada a la protección y aserción de transacciones de negocio. Implementa los pilares de la escalabilidad frontend: Single Responsibility (POM), Configuración Inmutable por Entornos (Environment Params), e Identidad Global Caching. Esto posicionará en firme la integración continua tan pronto se levante el switch del pipeline.

***

### ⏱️ Versión Corta (Pitch de 3 Minutos)

**"Hola a todos.** Hoy quiero presentarles nuestro framework de pruebas automatizadas E2E, construido en **TypeScript y Playwright** para ERP Perú 2.

**¿Qué resolvimos?**
Diseñamos una arquitectura basada en Page Object Model (POM) para que nuestros test sean resistentes a los continuos cambios de interfaz. 
A nivel de negocio, logramos cubrir las transacciones críticas: Autenticación, Movimientos logísticos, Insumos, y flujos peligrosos como las recargas masivas de Items.

**¿Cómo funciona por debajo?**
Para no sobrecargar los tests ni comernos el cuello de botella del login, Playwright se autentica **una única vez** al inicio y guarda una credencial maestra. Luego, para asegurar de que un proceso masivo *no rompa la validación en base de datos* de otro proceso adyacente, hemos seteado `workers: 1`, controlando que la inserción de data sea estrictamente serial y ordenada.

**¿Qué sigue?**
Nuestros pilares están maduros. Nuestro siguiente gran objetivo es prender con confianza nuestra tubería de GitLab CI que actualmente está pausada, e implementar ejecución basada en "Tags", permitiéndonos decirle a Playwright: *'Córreme únicamente los 5 escenarios más críticos'* con un simple flag. Esto robustece nuestra cultura de calidad entregando fe ciega de que ninguna actualización en Logística romperá el sistema."
