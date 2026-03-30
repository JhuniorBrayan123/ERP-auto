import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://erpperu2-crt.smartclic.pe/auth/login');
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).fill('gutierrezmamanijhuniorb+133@gmail.com');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).fill('S');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).fill('Smart123.');
  await page.getByRole('button', { name: 'INICIAR SESION' }).click();
  
  
});