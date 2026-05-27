import {expect, test as setup} from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {env} from '../config/env';
import {detectAccount, detectEnvironmentGroup, markSetupComplete, shouldSkipSetup} from '@utils/setup-state';
import {generarSlugCache} from '../src/factories/item-factory';

const SETUP_NAME = 'auth';
const authDir = path.join(__dirname, '../playwright/.auth');

function resolveStorageStatePath(): string {
    const envGroup = detectEnvironmentGroup();
    const account = detectAccount();
    const slug = generarSlugCache(envGroup, account);
    return path.join(authDir, `user.${slug}.json`);
}

function tieneSesionReal(): boolean {
    const authFile = resolveStorageStatePath();
    try {
        if (!fs.existsSync(authFile)) return false;
        const content = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
        // Sesión real = tiene cookies o localStorage con datos
        if (content.cookies?.length > 0) return true;
        if (content.origins?.length > 0) return true;
        return false;
    } catch {
        return false;
    }
}

setup('authenticate', async ({page}) => {
    if (shouldSkipSetup(SETUP_NAME) && tieneSesionReal()) {
        console.log(`[setup-state] ${SETUP_NAME} already completed with valid session, skipping`);
        return;
    }

    if (!tieneSesionReal()) {
        console.log(`[setup-state] ${SETUP_NAME}: storageState vacío o inexistente — ejecutando login real`);
    }

    // Es buena práctica asegurar que el directorio padre del storageState exista
    // para evitar errores ENOENT si la carpeta Playwright/.auth fue ignorada en git.
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, {recursive: true});
    }

    // ── Limpiar estado previo antes de autenticar ────────────────────
    // Esto evita redirect loops y sesiones cruzadas entre distintos
    // entornos (crt-2 ↔ crt-3) o cuentas distintas en el mismo CRT.
    await page.context().clearCookies();
    console.log('Cookies limpiadas');

    // Navegar al login primero para tener un origen válido,
    // y luego limpiar localStorage (requiere estar en el mismo dominio).
    await page.goto('/auth/login');
    console.log('Ingresando a la página del login');

    await page.evaluate(() => localStorage.clear());
    console.log('localStorage limpiado');

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

    // ── Guardar storageState con path dinámico ───────────────────────
    const authFile = resolveStorageStatePath();
    await page.context().storageState({path: authFile});
    console.log(`Sesión guardada correctamente en ${authFile}`);

    // ── Marcar completado ────────────────────────────────────────────
    markSetupComplete(SETUP_NAME);
});