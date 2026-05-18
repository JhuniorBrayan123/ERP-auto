/**
 * Fixture extendida para tests de PuntoVenta que requieren validación API.
 *
 * Extiende emision-fixture con:
 * - SunatEstadoApi (polling SUNAT)
 * - ComprobanteApi (consulta de comprobantes)
 * - KardexApi (verificación de stock — reutilización controlada de Logística)
 *
 * Uso: tests que necesitan Capa 2 SUNAT o validación de stock/kardex.
 */
import { test as emisionTest } from './emision-fixture';
import { SunatEstadoApi } from '../../services/PuntoVenta/SunatEstadoApi';
import { ComprobanteApi } from '../../services/PuntoVenta/ComprobanteApi';
import { KardexApi } from '../../services/Logistica/KardexApi';
import { AlmacenesApi } from '../../services/Logistica/AlmacenesApi';
import { getCachedToken } from '../auth/token-cache.fixture';

type ValidacionFixtures = {
    sunatApi: SunatEstadoApi;
    comprobanteApi: ComprobanteApi;
    kardexApi: KardexApi;
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
});

export { expect } from '@playwright/test';
