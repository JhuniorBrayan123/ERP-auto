const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://erpperu2-crt-2.smartclic.pe/login');
  await page.fill('[type="text"]', 'gutierrezmamanijhuniorb+122@gmail.com');
  await page.fill('[type="password"]', 'Smart123.');
  await page.click('button:has-text("Ingresar")');
  await page.waitForTimeout(3000);
  await page.goto('https://erpperu2-crt-2.smartclic.pe/PuntoVenta/Emision');
  await page.waitForTimeout(4000);
  
  // Continuar vendiendo
  if (await page.isVisible('button:has-text("Continuar vendiendo")')) {
    await page.click('button:has-text("Continuar vendiendo")');
  }
  await page.waitForTimeout(2000);
  
  // Seleccionar Factura
  await page.click('text=FACTURA');
  await page.waitForTimeout(2000);
  
  // Activar Detracción switch
  await page.locator('.switch-component').filter({hasText: /Detracci[oó]n/i}).locator('.slider').click();
  await page.waitForTimeout(1000);
  
  // Click Editar
  await page.locator('.switch-component').filter({hasText: /Detracci[oó]n/i}).getByRole('button', {name: 'Editar'}).click();
  await page.waitForTimeout(2000);
  
  // Get HTML of the modal
  const html = await page.innerHTML('.v-drape.is-open, .v-modal');
  console.log(html);
  
  await browser.close();
})();
