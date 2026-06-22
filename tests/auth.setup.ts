import {expect, test as setup} from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {env} from '../config/env';
import {detectAccount, detectEnvironmentFine, markSetupComplete, shouldSkipSetup} from '@utils/setup-state';
import {generarSlugCache} from '@factories/item-factory';

const SETUP_NAME = 'auth';
const authDir = path.join(__dirname, '../playwright/.auth');

function resolveStorageStatePath(): string {
    const envGroup = detectEnvironmentFine();
    const account = detectAccount();
    const slug = generarSlugCache(envGroup, account);
    return path.join(authDir, `user.${slug}.json`);
}

function tieneSesionReal(): boolean {
    const authFile = resolveStorageStatePath();
    try {
        if (!fs.existsSync(authFile)) return false;

        const stats = fs.statSync(authFile);
        const fileAgeMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
        if (fileAgeMinutes > 30) {
            console.log(`[setup-state] La sesión guardada tiene más de 30 minutos (${fileAgeMinutes.toFixed(0)}min). Se forzará un nuevo login.`);
            return false;
        }

        const content = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
        if (content.cookies?.length > 0) return true;
        if (content.origins?.length > 0) return true;
        return false;
    } catch {
        return false;
    }
}

/** Elimina storage states de CRT anteriores, conservando solo el actual y PRD */
function limpiarCrtAnteriores(actual: string): void {
    if (!fs.existsSync(authDir)) return;
    const actualName = path.basename(actual);
    for (const file of fs.readdirSync(authDir)) {
        if (!file.startsWith('user.crt') || file === actualName) continue;
        const fullPath = path.join(authDir, file);
        try {
            fs.unlinkSync(fullPath);
            console.log(`[setup-state] Storage state CRT anterior eliminado: ${file}`);
        } catch {
            // no crítico
        }
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

    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, {recursive: true});
    }

    await page.context().clearCookies();
    console.log('Cookies limpiadas');

    await page.goto('/auth/login');
    console.log('Ingresando a la página del login');

    await page.evaluate(() => localStorage.clear());
    console.log('localStorage limpiado');

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
    
    // Esperar a que el Home cargue completamente para asegurar que los tokens (JWT, etc) se guarden
    await page.waitForLoadState('networkidle');

    const authFile = resolveStorageStatePath();
    await page.context().storageState({path: authFile});
    console.log(`Sesión guardada correctamente en ${authFile}`);

    limpiarCrtAnteriores(authFile);
    markSetupComplete(SETUP_NAME);
});