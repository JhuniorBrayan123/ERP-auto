# 🚀 Guía de Inicio Rápido: ERP Perú 2 Automation

Bienvenido al repositorio oficial de pruebas automatizadas E2E del proyecto **ERP Perú 2**. Esta guía está diseñada para que cualquier desarrollador o ingeniero de QA pueda clonar, configurar y ejecutar las pruebas desde cero en menos de 5 minutos.

---

## 📋 1. Requisitos Previos

Antes de clonar el proyecto, asegúrate de tener instaladas las siguientes herramientas en tu computadora:

1. **[Node.js](https://nodejs.org/es/)** (Versión 18 o superior). Es el motor principal que ejecuta el proyecto. Para verificar si ya lo tienes, abre tu terminal y ejecuta: `node -v`
2. **[Git](https://git-scm.com/downloads)** para manejar el versionado y clonar el repo.
3. **Un Editor de Código**: Recomendamos [Visual Studio Code](https://code.visualstudio.com/) o WebStorm. (Si usas VS Code, instala la extensión oficial de "Playwright Test for VSCode").

---

## 🛠️ 2. Paso a Paso: Instalación y Configuración

Sigue estos comandos en tu terminal para levantar el proyecto desde cero:

### Paso 2.1: Clonar el repositorio
Descarga el código a tu máquina local y entra en la carpeta del proyecto:
```bash
git clone <URL_DEL_REPOSITORIO>
cd erpperu2-automation
```

### Paso 2.2: Instalar las dependencias de Node
Esto leerá el archivo `package.json` y descargará las librerías necesarias (como `exceljs`, `dotenv`, etc):
```bash
npm install
```

### Paso 2.3: Instalar los navegadores de Playwright (¡CRÍTICO!)
Si bien el comando anterior instaló la librería, **Playwright necesita sus propios navegadores internos** (Chromium, Firefox, WebKit) para funcionar. Ejecuta esto para descargar los navegadores y sus dependencias del sistema operativo:
```bash
npx playwright install --with-deps
```

### Paso 2.4: Archivos de Entorno (.env)
El proyecto utiliza variables de entorno para saber a qué ambiente apuntar (`.env.qa`, `.env.prd`). Asegúrate de que estos archivos estén presentes en la raíz de tu proyecto con el siguiente contenido base (pide las credenciales o la URL exacta al líder técnico si es necesario):

**Ejemplo de `.env.qa`:**
```env
BASE_URL=https://qa.ejemplo-erpperu.com
```

---

## ▶️ 3. Ejecutando tu primera prueba

¡Ya está todo listo! Playwright está configurado de manera centralizada. 

**Ejecutar todas las pruebas de forma "silenciosa" (Sin interfaz visual, recomendado para CI):**
```bash
npm run test
```

**Ejecutar las pruebas viendo el navegador (Modo Interactivo / UI):**
Esta es la mejor forma para que veas qué hace el robot paso a paso.
```bash
npx playwright test --ui
```

**Generar gráficamente una traza si un test falla:**
```bash
npx playwright test --trace on
```

---

## 💡 4. Comandos Frecuentes

*   `npx playwright show-report`: Abre el reporte analítico (HTML) de la última ejecución.
*   `npx playwright codegen <URL>`: Abre una sesión de grabación donde Playwright te auto-generará el código mientras tú haces clics en la página.
