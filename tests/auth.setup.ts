import { test as setup, expect } from '@playwright/test';
import * as path from 'node:path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    await page.goto('/auth/login');
    console.log('Ingresando a la página del login');
    await page
        .getByRole('textbox', { name: /Coloca aquí tu correo/i })
        .fill(process.env.USER_EMAIL!);
    await page
        .getByRole('textbox', { name: /Coloca aquí tu contraseña/i })
        .fill(process.env.USER_PASSWORD!);
    await page
        .getByRole('button', { name: /INICIAR SESION/i })
        .click();
    await expect(page).not.toHaveURL(/auth\/login/, { timeout: 15000 });
    await page.context().storageState({ path: authFile });
    console.log('Sesión guardada correctamente en playwright/.auth/user.json');
});