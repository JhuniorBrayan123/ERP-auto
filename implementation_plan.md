# Refactorización y Estabilización de Arquitectura de Pruebas (ErpPeru2 Automation)

Esta propuesta técnica responde a la auditoría del proyecto enfocada en resolver la fragilidad del código, incrementar la confianza de la suite automatizada al eliminar falsos positivos y habilitar la escalabilidad en integración continua (CI).

## User Review Required

> [!WARNING]
> **Cambios en Aserciones en los Tests:** Modificaremos masivamente **TODO** el directorio de `tests/` para aplicar aserciones donde hoy no existen. Esto podría hacer "explotar" temporalmente el reporte de pruebas, revelando errores reales (bugs) de la aplicación que las pruebas anteriores pasaban en verde por no estar validando. 
> 
> **Cambios en Paralelización:** Intentaremos diseñar la aislación de la prueba o el reinicio de los estados para re-habilitar `fullyParallel: true`. Necesito confirmar si la estructura de la base de datos permite a múltiples "workers" crear datos sin chocar entre ellos.

## Proposed Changes

A continuación, la división de los cambios propuestos ordenados por prioridad en los diferentes módulos y capas de la arquitectura:

### 1. Eliminación de estado estático y mejora de Servicios (Capa API)

Se modificará el modelo actual que causa fugas de memoria y sobreescrituras en ejecuciones con workers en Playwright. Se resolverán también vacíos de tipado:

#### [MODIFY] [AlmacenesApi.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/services/Logistica/AlmacenesApi.ts)
- Eliminar la variable `private static cachedQuery`.
- Introducir variable a nivel de instancia para asegurar la aislación por contexto (worker/test).
- Esto eliminará la necesidad del método de reset manual `AlmacenesApi.resetCache()`.

#### [MODIFY] [KardexApi.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/services/Logistica/KardexApi.ts)
- Eliminar los tipos `any`.
- Reforzar el tipado inferido, agregando aserciones seguras (`?.` no es suficiente si el index `[0]` falla).
- Agrupación semántica de los errores que se lanzan (Throwing Errors) en lugar de *strings* genéricos.

---

### 2. Refactorización de Page Objects y Utilidades

Se extraerán las responsabilidades aglomeradas en los POM y se corregirán métodos que enmascaran fallos (`catch` silenciosos).

#### [MODIFY] [MovimientoRapidoPage.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/pages/Logistica/MovimientoRapidoPage.ts)
- Remover la supresión de excepciones silenciosa `.catch(() => {})`. Las excepciones deben manejarse logueando el error explícitamente o propagando el fallo de la automatización.
- Extraer lógica RegExp repetitiva que parsean montos numéricos de strings a una utilidad base aislada, idealmente algo como `src/utils/parsers.ts`.
- Reemplazar localizadores frágiles basados en índices directos muy anidados o atributos UI dinámicos como `[id="..."]` donde sea posible, prefiriendo data-attributes (si existen) o roles Aria.

#### [NEW] [parsers.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/utils/parsers.ts)
- Nueva clase de utilidades de conversión UI a Modelo sin referencias a Puppeteer/Playwright. Esto sirve para testabilidad pura.

---

### 3. Fortalecimiento de Pruebas (Tests y Fixtures)

Es la fase más crítica y grande, en ella agregaremos certidumbre determinística a los flujos. 

#### [MODIFY] [MS-1-ingreso.spec.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts) (y resto de tests en Logística)
- **Aserciones en todo contexto:** Todo `test.step` que finalice una interacción, debe hacer un `expect()` explícito para validar un Toast de éxito, la presencia en la grilla, el valor final de Kardex o de un modal en la UI. Sin esto la prueba carece de credibilidad.
- Eliminar por completo sentencias `await page.waitForTimeout(2000);`.
- Reemplazarlas con `.waitFor({ state: 'visible' })`, `.waitForResponse(...)` interceptando el backend, u aserciones `expect(...).toBeVisible()`.
- Optimizar la lectura removiendo llamadas de `await import(...)` dinámicas a mitad del test, llevándolas al top level del stack.

#### [MODIFY] [movimientos-fixture.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/src/fixtures/Logistica/movimientos-fixture.ts)
- Reemplazar todas las rutas relativas masivas (`../../pages/Logistica/MovimientosNavigationPage`) por el alias definido existente `@pages/Logistica/MovimientosNavigationPage`.
- Limpieza general.

---

### 4. Entorno Global

#### [MODIFY] [playwright.config.ts](file:///c:/Users/USER/WebstormProjects/erpperu2-automation/playwright.config.ts)
- Como etapa final o prueba piloto (Feature Flag temporal): Activar `fullyParallel: true` una vez estabilizado el estado, midiendo su porcentaje de falla respecto a la competencia de datos.

## Open Questions

> [!CAUTION]
> 1. **Data Isolation**: ¿Podemos crear datos limpios (ej. un producto distinto y un almacén virtual nuevo) por prueba automáticamente? Si no es posible y debemos re-usar los mismos códigos de producto base (como `VARIANTE FLEXIBLE`), NO podremos paralelizarlos exitosamente debido a las colisiones de lectura.
> 2. Puesto que en los _tests_ no hay validaciones finales (como de mensajes "Éxito"), antes de programar aserciones dinámicas necesito saber: ¿Existe algún elemento de UI común de éxito (como un Toast notification de color verde) que aparezca en pantalla finalizado el registro del movimiento?


## Verification Plan

### Automated Tests
1. Correr Suite de Regresión Localmente: `npx playwright test`. Las pruebas de "MS-X" (Movimientos) no deben fallar aleatoriamente.
2. Comprobación de Tiempos de ejecución: Una vez removidos los miles de milisegundos quemados en los *Sleeps*, una ejecución local con worker 1 debe ser un 15 a 30% más rápida. 
3. Ejecutar TypeScript Compiler `npx tsc --noEmit` para asegurar la nula existencia de fallos en nuestra estructura por los cambios a los tipos.

### Manual Verification
1. Introducir un error de sintaxis en falso de manera manual a nivel de DOM usando herramientas en el ambiente de Dev, el test automatizado DEBE detenerse por el `expect()`. (Prueba del Falso Positivo).
