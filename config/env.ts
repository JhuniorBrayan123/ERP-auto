import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({path: path.resolve(__dirname, 'environment.env')});

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno: ${name} — revisa config/environment.env`);
    }
    return value;
}

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