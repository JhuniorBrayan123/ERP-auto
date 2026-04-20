//await page.goto('https://erpperu2-crt-4.smartclic.pe/404');
await page.getByText('Productos y servicios').click();
await page.getByText('Ingresos', { exact: true }).click();
await page.getByText('Agregar ingreso').click();
await page.getByRole('button', { name: 'Datos opcionales' }).click();
await page.getByRole('button', { name: 'Añadir comprobante' }).click();
await page.getByRole('button', { name: 'Añadir' }).click();
await page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3).click();
await page.getByText('FACTURA').click();
await page.getByRole('button', { name: 'Añadir' }).click();
await page.locator('.icon').first().click();
await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
await page.getByRole('button', { name: 'CANCELAR' }).click();
// Como lo se lleno nigun dato no permite crear el ingreso se espear eso 