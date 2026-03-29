import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
    await page.goto('/auth/login');                          // usa baseURL del .env
        console.log("Ingresando a la pagina del login");
    await page.getByRole('textbox', { name: 'Coloca aquí tu correo electrónico' })
        .fill(process.env.USER_EMAIL!);
    await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' })
        .fill(process.env.USER_PASSWORD!);
    await page.getByRole('button', { name: /iniciar sesion|iniciar sesión/i }).click();
        console.log("Login hecho correctamente");
    await expect(page.getByText('¿Dónde deseas ingresar?')).toBeVisible();
        console.log("Viendo el modal de lista de empresas");
});
