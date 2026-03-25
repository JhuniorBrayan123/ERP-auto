// 1. Iniciar un navegador
//  Abre contextos para google
// 3. ,Abrir una pagina dentro de cada contexto(sesiones de usuairo)
// realizar operaciones basicas en cada pagina

const { chromium } = require('playwright');

(async () => {
  // 1. contexto de google
  const browser = await chromium.launch({ headless: false });

  const googleContext = await browser.newContext();
   const googlePage = await googleContext.newPage();
    await googlePage.goto('https://www.google.com');
})();