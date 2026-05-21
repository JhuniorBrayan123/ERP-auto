import {expect, test as setup} from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {env} from '../config/env';
import {shouldSkipSetup, markSetupComplete} from '@utils/setup-state';

const SETUP_NAME = 'auth';
const authDir = path.join(__dirname, '../playwright/.auth');
const authFile = path.join(authDir, 'user.json');

setup('authenticate', async ({page}) => {
    // ── Auto-skip si ya completado ───────────────────────────────────
    if (shouldSkipSetup(SETUP_NAME)) {
        console.log(`[setup-state] ${SETUP_NAME} already completed, skipping`);
        return;
    }

    // Es buena práctica asegurar que el directorio padre del storageState exista
    // para evitar errores ENOENT si la carpeta Playwright/.auth fue ignorada en git.
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, {recursive: true});
    }

    await page.goto('/auth/login');
    console.log('Ingresando a la página del login');

    // Usamos las variables seguras desde nuestro config/env.ts centralizado
    await page
        .getByRole('textbox', {name: /Coloca aquí tu correo/i})
        .fill(env.userEmail);
    await page
        .getByRole('textbox', {name: /Coloca aquí tu contraseña/i})
        .fill(env.userPassword);

    await page
        .getByRole('button', {name: /INICIAR SESION/i})
        .click();

    await expect(page).not.toHaveURL(/auth\/login/, {timeout: 15000});

    await page.context().storageState({path: authFile});
    console.log('Sesión guardada correctamente en playwright/.auth/user.json');

    // ── Marcar completado ────────────────────────────────────────────
    markSetupComplete(SETUP_NAME);
});