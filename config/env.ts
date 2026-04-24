/**
 * Acceso tipado a las variables de entorno.
 * Centralizamos la carga de dotenv aquí. Ningún otro archivo debe llamar a dotenv.config().
 *
 * Solo se necesita cambiar APP_ENV en environment.env para apuntar a otro entorno.
 * Las URLs (baseUrl y apiUrl) se construyen automáticamente.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde config/environment.env
dotenv.config({path: path.resolve(__dirname, 'environment.env')});

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno: ${name} — revisa config/environment.env`);
    }
    return value;
}

/**
 * Construye las URLs del frontend y backend a partir de APP_ENV.
 *
 * Regla de negocio:
 *   - prd  → https://erpperu2.smartclic.pe/    | https://erpperuapi.smartclic.pe/
 *   - otro → https://erpperu2-{env}.smartclic.pe/ | https://erpperuapi-{env}.smartclic.pe/
 */
function buildUrls(appEnv: string): { baseUrl: string; apiUrl: string } {
    if (appEnv === 'prd') {
        return {
            baseUrl: 'https://app.smartclic.pe/',
            apiUrl: 'https://erpperuapi.smartclic.pe/',
        };
    }
    return {
        baseUrl: `https://erpperu2-${appEnv}.smartclic.pe/`,
        apiUrl: `https://erpperuapi-${appEnv}.smartclic.pe/`,
    };
}

const appEnv = required('APP_ENV');
const {baseUrl, apiUrl} = buildUrls(appEnv);



export const env = {
    appEnv,
    baseUrl,
    apiUrl,
    userEmail: required('USER_EMAIL'),
    userPassword: required('USER_PASSWORD'),
    browser: process.env.BROWSER || 'chromium',
};