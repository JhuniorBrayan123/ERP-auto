import * as dotenv from 'dotenv';
import * as path from 'path';

// Carga environment.env UNA vez por proceso. dotenv no sobreescribe vars ya
// seteadas; si el módulo se re-requiere (tests unitarios con require.cache),
// sin este guard cada require re-inyecta el archivo y rompe el aislamiento.
const globalScope = globalThis as unknown as {__ERP_ENV_LOADED__?: boolean};
if (!globalScope.__ERP_ENV_LOADED__) {
    dotenv.config({path: path.resolve(__dirname, 'environment.env')});
    globalScope.__ERP_ENV_LOADED__ = true;
}

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

/**
 * Normaliza una mención de usuario de Discord:
 * `123` o `<@123>` → `<@123>`. Devuelve undefined si no hay valor.
 * (El soporte de roles se eliminó: solo se menciona al ejecutor.)
 */
export function normalizeMention(raw: string | undefined): string | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const inner = trimmed.replace(/^<@/, '').replace(/>$/, '');
    return `<@${inner}>`;
}

export function envFlag(name: string): boolean {
    const value = process.env[name];
    return value === '1' || value?.toLowerCase() === 'true';
}

/** Config del reporter de Discord, 100% por env. No-throwing: sin vars → defaults. */
export const discordEnv = {
    enabled: envFlag('DISCORD_REPORT_ENABLED'),
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    testerName: process.env.DISCORD_TESTER_NAME,
    userId: normalizeMention(process.env.DISCORD_USER_ID),

    dryRun: envFlag('DISCORD_DRY_RUN'),
};