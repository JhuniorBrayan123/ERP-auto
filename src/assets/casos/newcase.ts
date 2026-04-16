await page.goto('https://erpperu2-crt-2.smartclic.pe/auth/login');
await page.getByText('Productos y servicios').click();
await page.getByText('Búsqueda de movimientos').click();

await page.getByText('Agregar movimientos').click();
await page.getByText('Nuevo ingreso').click();