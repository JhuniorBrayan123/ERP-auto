# Reglas y Estándares del Proyecto (erpperu2-automation)

Este archivo define las instrucciones, directrices de arquitectura y reglas que los agentes de IA (como yo) deben seguir estrictamente al generar, refactorizar o analizar código en este repositorio.

## Reglas del Agente Orquestador QA

### 1. Documentación como fuente oficial

1. Antes de proponer una implementación, el agente DEBE consultar la documentación oficial disponible en BookStack (Book 9 / Chapter 6 "Guias QA").
2. El agente DEBE indicar qué páginas, capítulos o secciones utilizó para sustentar su propuesta.
3. El agente NO DEBE inventar convenciones cuando exista documentación oficial aplicable.
4. Si la documentación es inexistente, incompleta o contradictoria, el agente DEBE detener la implementación y reportar el vacío.
5. Cuando exista una diferencia entre BookStack y el código actual, el agente NO DEBE decidir unilateralmente cuál es correcto. Debe presentar la contradicción y solicitar una decisión humana.

### 2. Análisis previo del proyecto

Antes de crear o modificar una prueba, el agente DEBE:

1. Buscar pruebas similares en el mismo módulo o submódulo.
2. Revisar fixtures, helpers, Tasks, Interactions, Questions, Pages y utilidades existentes.
3. Identificar componentes que puedan reutilizarse.
4. Verificar las convenciones de nombres y ubicación de archivos.
5. Revisar la configuración aplicable de Playwright.
6. Determinar si el cambio requiere un setup o prerrequisito.
7. Evaluar el impacto sobre otras pruebas o configuraciones.

### 3. Planificación obligatoria

El agente NO DEBE implementar directamente un cambio mediano o grande.

Primero DEBE entregar un plan con:

- objetivo del cambio;
- documentación consultada;
- pruebas similares encontradas;
- componentes reutilizables;
- archivos que serán creados;
- archivos que serán modificados;
- riesgos;
- validaciones;
- alcance y elementos fuera de alcance.

La implementación solo debe comenzar después de la aprobación humana.

### 4. Manejo de incertidumbre

El agente DEBE diferenciar claramente:

- hechos obtenidos de BookStack;
- hechos observados en el código;
- inferencias propias;
- recomendaciones;
- información pendiente de confirmación.

Si un criterio funcional no está definido, debe solicitar aclaración. No debe convertir una suposición en una regla de negocio.

### 5. Control de cambios

1. No modificar configuraciones globales sin autorización.
2. No agregar dependencias sin justificar su necesidad.
3. No eliminar código existente sin analizar referencias.
4. No modificar pruebas ajenas al alcance aprobado.
5. No almacenar secretos, tokens, contraseñas o datos sensibles.
6. No ejecutar comandos destructivos sin confirmación explícita.
7. No escribir automáticamente en BookStack durante la primera fase.

### 6. Validación de la implementación

Antes de declarar una implementación como finalizada, el agente DEBE:

1. Ejecutar `npx tsc --noEmit`.
2. Ejecutar únicamente la prueba modificada o creada.
3. Revisar errores de lint, si el proyecto dispone de lint.
4. Verificar que no existan credenciales o datos sensibles.
5. Revisar que no se hayan agregado esperas fijas innecesarias.
6. Verificar reutilización de componentes.
7. Comparar el resultado contra la documentación consultada.
8. Entregar el comando de ejecución y el resultado.

## Estándar técnico obligatorio de automatización

### 1. Arquitectura Híbrida: POM + Screenplay

El proyecto utiliza **Playwright con TypeScript** y emplea una arquitectura híbrida que combina el Patrón **Screenplay** y el **Page Object Model (POM)**.

- **POM (`src/pages/`)**: Se utiliza para abstraer la estructura de las páginas (layouts, navegación entre secciones de la misma vista, modales complejos). Las páginas agrupan acciones elementales que luego pueden ser consumidas por las Interacciones o Tareas del patrón Screenplay.
- **Screenplay (`src/screenplay/`)**: Es el patrón principal para los flujos de negocio. Los tests deben estar escritos desde la perspectiva del Actor (ej. `vendedor.realiza(...)`).
  - **Targets (`src/screenplay/targets/`)**: Contienen exclusivamente localizadores (locators) organizados por módulo (ej. `CotizacionTargets`, `PagoTargets`). NO contienen lógica, solo devuelven `Locator`.
  - **Interactions (`src/screenplay/interactions/`)**: Acciones atómicas de bajo nivel que interactúan con la UI (clics, ingresos de texto, intercepción de APIs, manejo de popups).
  - **Tasks (`src/screenplay/tasks/`)**: Flujos de alto nivel del negocio que agrupan varias interacciones (ej. `CrearPedidoVF`, `EmitirFacturaConRetencion`).
  - **Questions (`src/screenplay/questions/`)**: Funciones que retornan el estado de la aplicación para hacer aserciones (ej. validación de modales, presencia de elementos en listas).

### 2. Estrategia de Localizadores (Locators)

1. **Robusted Ante Todo**: Los selectores deben ser lo más estables posible. La prioridad es usar atributos inmutables del DOM generados por el framework:
   - **Prioridad 1**: `id` estáticos y robustos (ej. `[id="pv_ventas_cmp-punto-venta_v-modal..."]`).
   - **Prioridad 2**: `data-testid` o atributos data personalizados si existen.
   - **Prioridad 3**: `getByRole` o `getByText` con selectores precisos y exactos.
2. **Evitar Fragilidad**: NO usar rutas CSS largas, dependientes de estructura (`div > div > span:nth-child(2)`) a menos que sea la única opción disponible.
3. **No Hardcodear en Tests**: Los locators **NUNCA** deben estar en los archivos `.spec.ts`. Siempre deben estar centralizados en la capa de `Targets` o dentro del `Page` correspondiente.
4. **No Inventar Locators**: Si un input, botón o elemento no tiene un locator definido en el `Page` o `Target` correspondiente, el agente **NUNCA** debe adivinar o inventar uno (como forzar un `getByRole` genérico dentro de la Tarea). El agente debe primero mapear el locator correcto (idealmente por ID) en el archivo POM (`Page`) correspondiente y solo entonces consumirlo en la Tarea. Si no logra encontrar el ID real, debe solicitar asistencia humana.

### 3. Manejo de Asincronía y Tiempos de Espera (Waits)

#### Carga de pantallas

El proyecto utiliza popups y pantallas de carga (overlays). Siempre usar la función `esperarCargaOverlay(page)` proveniente de `@utils/wait-helpers` después de acciones que disparan peticiones al backend o renderizados pesados.

#### Intercepción de APIs

Para acciones como emitir comprobantes, se **DEBE** interceptar la respuesta de la API usando `page.waitForResponse` ANTES de realizar el clic de confirmación para no perder la traza de la respuesta y poder capturar datos valiosos (como el `correlativo` o `serie`).

#### Prohibición de esperas fijas

NUNCA utilizar `page.waitForTimeout()` o `sleeps` fijos a menos que sea estrictamente necesario (ej. una animación bloqueante de un proveedor de terceros).

### 4. Gestión de Datos y Fixtures

#### Fixtures personalizados

Los tests deben usar el entorno provisto por los fixtures. Para el módulo de ventas, usar siempre `@fixtures/PuntoVenta/cotizacion-pedido.fixture`, el cual provee el actor configurado (ej. `vendedor`).

#### Datos de prueba

Toda la data (clientes, productos, configuraciones de caja) debe consumirse desde los helpers (`@helpers/PuntoVenta/emision-data.helper.ts`). **No quemar datos duros en los tests** (ej. RUCs o nombres de productos quemados).

### 5. Principios de Código

#### DRY

La lógica repetida debe extraerse. Si varios tests hacen clics de pago, esos clics deben abstraerse en una sola Interacción.

#### Aserciones

Los `.spec.ts` son el único lugar donde debe haber `expect()` sobre reglas de negocio. Ocasionalmente, una Interaction puede tener un expect de seguridad (para asegurar carga de UI), pero el test debe tener la aserción final (usando Questions siempre que sea posible).

#### TypeScript

Antes de presentar una implementación como terminada, ejecutar `npx tsc --noEmit`.
