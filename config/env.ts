/**
 * Acceso tipado a las variables de entorno.
 * Centralizamos la carga de dotenv aquí. Ningún otro archivo debe llamar a dotenv.config().
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde config/environment.env
dotenv.config({ path: path.resolve(__dirname, 'environment.env') });

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