import {Page} from '@playwright/test';
import {getAccessToken} from '../../helpers/Logistica/get-access-token.helper';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const CACHE_TTL_MS = 50 * 60 * 1000;

export async function getCachedToken(page: Page): Promise<string> {
    const now = Date.now();

    if (cachedToken && tokenExpiry && now < tokenExpiry) {
        return cachedToken;
    }

    cachedToken = await getAccessToken(page);
    tokenExpiry = now + CACHE_TTL_MS;

    return cachedToken;
}
