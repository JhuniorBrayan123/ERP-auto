/**
 * Acceso tipado a las variables de entorno.
 * Todas se leen de config/environment.env (cargadas por playwright.config.ts vía dotenv).
 */

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno: ${name} — revisa config/environment.env`);
    }
    return value;
}

export const env = {
    baseUrl: required('BASE_URL'),
    userEmail: required('USER_EMAIL'),
    userPassword: required('USER_PASSWORD'),
    browser: process.env.BROWSER || 'chromium',
};