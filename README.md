# 🚀 ERP Perú 2 — QA Automation

![Playwright](https://img.shields.io/badge/Playwright-1.58.2-blue?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2020-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![ExcelJS](https://img.shields.io/badge/ExcelJS-4.4.0-brightgreen)

Este proyecto contiene la automatización de pruebas End-to-End (E2E) para el sistema **ERP Perú 2**.
El propósito general es validar de manera automatizada y robusta la integridad de las operaciones logísticas, de inventario (Kardex, stock) y de punto de venta, combinando validaciones desde la UI con comprobaciones en la base de datos a través de la API.

---

## ⚡ Quick Start (Instalación)

Sigue estos pasos en orden para configurar tu entorno local por primera vez:

```bash
# 1. Clonar el repositorio
git clone https://github.com/GU-CalidadTI/erpperu2-automation.git
cd erpperu2-automation

# 2. Instalar dependencias del proyecto y navegadores
npm install
npx playwright install

# 3. Configurar variables de entorno
# Crea el archivo config/environment.env con tu configuración (APP_ENV, USER_EMAIL, USER_PASSWORD)

# 4. Ejecutar tests (incluye los setup projects automáticos)
npx playwright test
```

---

## ▶️ Comandos de Ejecución Rápidos

### Menú Interactivo (Recomendado)

```bash
npm run test:menu
```

Se abre un menú en la terminal donde puedes navegar por módulo, buscar un caso específico o abrir la UI gráfica de Playwright.

### Comandos directos

```bash
# Todo un módulo
npx playwright test --grep "@logistica"
npx playwright test --grep "@punto-venta"

# Solo un caso o archivo específico
npx playwright test --grep "@MS-1"
npx playwright test tests/Logistica/Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts

# UI gráfica y reportes
npx playwright test --ui
npx playwright show-report
```

---

## 📚 Documentación Detallada

Para reducir la carga cognitiva, la documentación profunda está dividida en archivos específicos en la carpeta `docs/`.

- 📋 **[Casos Automatizados](docs/TESTS.md):** Lista completa de todas las pruebas cubiertas (Logística, Productos, Punto de Venta, Guías de Remisión).
- 🏗️ **[Arquitectura y Estructura](docs/ARCHITECTURE.md):** Stack tecnológico, estructura de carpetas, Patrón POM + Screenplay y Pipeline de Setup Projects.
- 📐 **[Convenciones y Estándares](docs/GUIDELINES.md):** Reglas de nomenclatura, variables de entorno y buenas prácticas de automatización.
- 🔧 **[Troubleshooting y Reportes](docs/TROUBLESHOOTING.md):** Qué hacer si falla un test, cómo interpretar los traces, configuración de Allure y alertas por Discord.

---

*Última actualización: Septiembre 2026 — Equipo QA Automatización ERP Perú 2*
