# Explicación de Arquitectura: Test Híbridos UI/API y Multi-Tenant en Kardex

Este documento resume la estrategia, el problema que existía y la solución implementada para modernizar las validaciones de Kardex en nuestro framework de Playwright. Ideal para presentarlo al equipo de TI o Gerencia.

## 1. La Estrategia: ¿Por qué Híbrido (UI + API)?

En nuestra suite de Logística, los flujos (Ingreso, Salida, Traslado, Eliminación) constan de:
1. **Acción de Negocio:** El usuario interactúa con la UI (crea un movimiento).
2. **Impacto/Verificación:** Validar que el stock subió o bajó correctamente en el Kardex.

**El Enfoque Anterior (100% UI):**
Realizar las verificaciones usando exclusivamente la interfaz gráfica implicaba navegar por varias pantallas, abrir popups, esperar tiempos de carga pesados (loaders), interceptar tablas, esperar renders y hacer validaciones de texto (ej. "Varios*"). Esto volvía los tests lentos, volátiles (flaky) y muy densos.

**La Estrategia Híbrida Actual:**
Decidimos que **las acciones del usuario se prueban en UI**, pero **la verificación de integridad de datos se hace por debajo, directamente consultando la API** (backend). 
* **Ventajas:** Aumentamos drásticamente la velocidad de los tests, evitamos falsos negativos por fallas de renderizado y confirmamos el verdadero impacto en la base de datos (Backend), garantizando seguridad matemática en los saldos.

---

## 2. El Problema que Surgió: "El Bloqueo Multi-Tenant"

Al migrar a llamadas API directas para obtener el Kardex (`KardexApi`), nos encontramos con un problema arquitectónico importante entre entornos y cuentas de usuario.

El ERP es un sistema "Multi-Tenant" (multi-inquilino). Esto significa que **cada cuenta de QA o cliente tiene sus propios identificadores únicos (IDs) en la base de datos**.

> [!WARNING]
> Originalmente, el código consumía la API de búsqueda avanzada usando unos filtros estáticos ("quemados") sacados del archivo de configuración `env.ts`. Mandábamos parámetros fijos como `&Almacenes=255629&Almacenes=255630`. 

**¿Qué ocurría?**
Cuando el QA1 corría tests en `crt`, la API de Kardex reconocía los IDs y respondía bien. Pero cuando el QA2 intentaba ejecutar la suite con sus credenciales en `crt-4` (donde los IDs de almacén interno eran `255737`), el backend de Kardex retornaba un arreglo vacío `Data: []`. Al no existir el almacén `255629` en esa cuenta, el sistema desechaba cualquier resultado.

---

## 3. ¿Cómo resolvimos esto tecnológicamente?

Implementamos un **patrón de "Descubrimiento Dinámico de Datos (Data Provisioning)"** acoplado al orquestador de Playwright (Fixtures). Los tests se "auto-configuran" basándose en la cuenta que inició sesión, de la siguiente forma:

### Fase 1: Extracción Inteligente de IDs (`AlmacenesApi.ts`)
Creamos una clase dedicada responsable de averiguar el "mapa" de la cuenta logueada:
* Inmediatamente después del Login, interceptamos y consumimos el endpoint secreto de configuración del Kardex (`/Logistica/api/v1/kardexs/total/combos/filtro`).
* Este endpoint devuelve cuáles son los IDs reales (`Value`) vigentes asignados a esa empresa.

### Fase 2: Inyección de Dependencias Limpia (Fixtures)
En Playwright centralizamos el orquestador en `movimientos-fixture.ts`. 
* La _fixture_ se anticipa al test. Carga el token del QA, invoca a `AlmacenesApi`, extrae la "query" con los IDs actualizados de la sesión y recién ahí "fabrica" e inicializa nuestro viejo `KardexApi` para entregárselo listo al test.

### Fase 3: Caché Dinámico de Sesión
Para no degradar la velocidad haciendo esta llamada descubridora cientos de veces, abstrajimos la respuesta empleando un atributo `static` (caché en memoria de Node). 
* Si se ejecutan 50 tests, el descubrimiento de IDs hacia la API se hace **solamente para el primer test**. Los 49 siguientes reutilizan los IDs en microsegundos.

---

## 4. Beneficios Obtenidos (El Retorno de Inversión)

> [!TIP]
> Esta arquitectura proporciona escalabilidad y reduce drásticamente el mantenimiento del equipo de Automatización.

1. **Portabilidad Total:** El Framework ahora soporta múltiples QAs paralelos, nuevas cuentas sin importar sus bases de datos y no requiere intervención humana de código para funcionar en `crt`, `crt-2`, `crt-3`, `prd` u otros tenants.
2. **"Data-Driver" de Variables de Entorno:** Limpiamos nuestro archivo `.env`. El equipo de QA solo tiene que preocuparse por 2 cosas ahora: Su Email y su Contraseña (`environment.env`).
3. **Mantenibilidad:** Retiramos dependencias hardcodeadas, lo que a futuro previene roturas críticas del pipeline de automatización si un administrador decidiera reconstruir los IDs internamente y asegura un código aséptico y encapsulado.
