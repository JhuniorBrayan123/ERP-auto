import { test as emisionTest } from './emision-fixture';
import { SunatEstadoApi } from '@services/PuntoVenta/SunatEstadoApi';
import { ComprobanteApi } from '@services/PuntoVenta/ComprobanteApi';
import { KardexApi } from '@services/Logistica/KardexApi';
import { AlmacenesApi } from '@services/Logistica/AlmacenesApi';
import { CajasApi } from '@services/PuntoVenta/CajasApi';
import { getCachedToken } from '../auth/token-cache.fixture';

type ValidacionFixtures = {
    sunatApi: SunatEstadoApi;
    comprobanteApi: ComprobanteApi;
    kardexApi: KardexApi;
    cajasApi: CajasApi;
};

export const test = emisionTest.extend<ValidacionFixtures>({
    sunatApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        await use(new SunatEstadoApi(request, token));
    },

    comprobanteApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        await use(new ComprobanteApi(request, token));
    },

    kardexApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        const almacenesApi = new AlmacenesApi(request, token);
        const almacenesQuery = await almacenesApi.buildAlmacenesQuery();
        await use(new KardexApi(request, token, almacenesQuery));
    },

    cajasApi: async ({ request, page }, use) => {
        const token = await getCachedToken(page);
        await use(new CajasApi(request, token));
    },
});

export { expect } from '@playwright/test';
