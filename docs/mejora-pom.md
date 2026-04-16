# Mejora: Implementación de Page Object Model (POM) en Pruebas E2E de Playwright

Este documento sirve como registro y guía técnica sobre la refactorización de las pruebas E2E (enfocado en el flujo de creación de ítems), mediante la adopción de la arquitectura Page Object Model.

## 1. El Problema Original
Los archivos de prueba originales (`crear-item-avanzado.spec.ts` y `crear-item-basico.spec.ts`) presentaban los siguientes retos de mantenibilidad y escalamiento:
- **Selectores dependientes y complejos:** El uso de selectores CSS extensos basados en el árbol del DOM y IDs generados (como `[id="lgt_cmp-registro-item..."]`) hacía que el test fuera extremadamente frágil. 
- **Lógica repetitiva y código acoplado:** La espera de elementos que desaparecen del DOM (ej. overlays de carga), o la asignación de stocks interactuando con modales estaban esparcidos docenas de veces a lo largo del mismo archivo.
- **Archivos difíciles de leer:** La lógica para controlar el navegador/DOM estaba mezclada con el flujo lógico "natural" de un Caso de Uso de negocio, provocando archivos `.spec.ts` de cientos de líneas.

## 2. La Solución Aplicada (Patrón POM)

El framework Playwright recomienda separar la interacción con el navegador (DOM Objects) de las reglas lógicas del negocio (Specs). 

### Capa Interfaz (Page Object - `InventarioPage.ts`)
*Ubicación sugerida: `tests/Logistica/pages/InventarioPage.ts`*
- **Locators Encapsulados:** Se extrajeron todos los elementos interactuables declarándolos como tipos de dato de Playwright `readonly Locator`. Estos son inicializados dentro del `constructor()` con nombres de variables amigables en español (ej. `inputNombreProducto`, `botonCrear`).
- **Métodos Asíncronos Descriptivos:** Se consolidaron lógicas enteras (ej. llenar detalles de variantes y stocks, o gestionar equivalencias) en funciones asíncronas aisladas, asumiendo responsabilidad absoluta sobre eventos frágiles como tiempos de espera de carga `await this.esperarCarga()`.

### Capa Pruebas (Specs - `ejemplo.spec.ts`)
*Ubicación sugerida: `tests/Logistica/Productos-Stock/ejemplo.spec.ts`*
- **Aislamiento a través de Hooks (`test.beforeEach`):** Se declara la instanciación principal de la página POM justo antes de iniciar cada escenario individual para asegurar un _state_ limpio y prevenir choques al ejecutar pruebas en pararelo (Fully Parallel Mode). 
- **Lenguaje Transparente tipo BDD (Behavior Driven Development):** El desarrollador o QA ahora arma sus escenarios utilizando solamente peticiones concretas (ej. `await inventarioPage.iniciarCreacionNuevoProducto()`). A simple vista parece una prueba construida con palabras del negocio en lugar de código estructurado.

## 3. Beneficios Obtenidos

> [!TIP]
> **Resiliencia ante cambios y Único Punto de Falla**

- **Rápida Adaptabilidad Visual:** Si mañana un botón de guardado cambia de ID, clase o estructura en el sistema ERP, solamente debes entrar al archivo `InventarioPage.ts`, alterar 1 única línea (el constructor de su variable), y los más de 20 tests distintos que usan ese botón de guardado volverán a la normalidad sin tocar sus respectivos `spec.ts` individuales. 
- **Pruebas a prueba de inestabilidades (Flakiness):** La correcta manipulación de promesas en POM minimiza los temidos _tests flaky_, sobre todo cuando se lidia con spinners o bloqueadores interactivos dependientes de respuestas HTTP del Backend.

## 4. Guía para Estrofas y Nuevos Flujos
Cuando un QA o automatizador vaya a crear nuevos flujos de prueba:
1. No incrustar un `page.locator()` o `page.click()` ni aserciones de bajo nivel directamente en un test.
2. Identificar qué página o modal engloba la nueva funcionalidad.
3. Declarar el Locator deseado como `readonly` en su componente `XXXPage.ts`.
4. Extender o reutilizar los métodos en esa clase para manejar ese selector.
5. Invocar dichos métodos limpiamente en el flujo de test final.
