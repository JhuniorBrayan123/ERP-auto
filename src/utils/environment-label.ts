export function getEnvironmentLabel(): string {
    const explicit = (process.env.ENV_NAME ?? '').trim();
    if (explicit) {
        return explicit.toUpperCase();
    }

    const baseUrl = (process.env.BASE_URL ?? process.env.baseURL ?? '').toLowerCase();
    if (baseUrl.includes('app.smartclic.pe') || baseUrl.includes('erpperu2.smartclic.pe')) return 'PRD';

    
    const urlMatch = baseUrl.match(/erpperu2-([^.]+)\.smartclic\.pe/);
    if (urlMatch) {
        return urlMatch[1].toUpperCase();
    }

    const appEnv = (process.env.APP_ENV ?? '').toLowerCase();
    if (appEnv === 'prd' || appEnv === 'prod' || appEnv === 'production') return 'PRD';

    if (appEnv === 'crt' || appEnv === 'crt-1') return 'CRT-1';
    if (appEnv === 'crt-2') return 'CRT-2';
    if (appEnv === 'crt-3') return 'CRT-3';
    if (appEnv === 'crt-4') return 'CRT-4';

    
    if (appEnv) {
        return appEnv.toUpperCase();
    }

    return 'DESCONOCIDO';
}
