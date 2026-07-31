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

/**
 * Normaliza una mención de Discord:
 * - kind 'user': `123` o `<@123>` → `<@123>`
 * - kind 'role': `456` o `<@&456>` → `<@&456>`
 * Devuelve undefined si no hay valor.
 */
export function normalizeMention(raw: string | undefined, kind: 'user' | 'role'): string | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const inner = trimmed.replace(/^<@&?/, '').replace(/>$/, '');
    return kind === 'role' ? `<@&${inner}>` : `<@${inner}>`;
}

function envFlag(name: string): boolean {
    const value = process.env[name];
    return value === '1' || value?.toLowerCase() === 'true';
}

/** Config del reporter de Discord, 100% por env. No-throwing: sin vars → defaults. */
export const discordEnv = {
    enabled: envFlag('DISCORD_REPORT_ENABLED'),
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    testerName: process.env.DISCORD_TESTER_NAME,
    userId: normalizeMention(process.env.DISCORD_USER_ID, 'user'),
    mentionRole: normalizeMention(process.env.DISCORD_MENTION_ROLE, 'role'),
    onlyFailures: envFlag('DISCORD_ONLY_FAILURES'),
    dryRun: envFlag('DISCORD_DRY_RUN'),
};