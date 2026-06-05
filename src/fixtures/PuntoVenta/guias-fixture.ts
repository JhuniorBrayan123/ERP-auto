import {test as base} from '@playwright/test';
import {Cajero} from '../../actors/cajero';
import {ListadoGuiasPage} from '@pages/PuntoVenta/guias-remision/ListadoGuiasPage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {KardexApi} from '../../services/Logistica/KardexApi';
import {AlmacenesApi} from '../../services/Logistica/AlmacenesApi';
import {getCachedToken} from '../auth/token-cache.fixture';

type GuiasFixtures = {
    cajero: Cajero;
    listadoGuiasPage: ListadoGuiasPage;
    busquedaComprobantes: BusquedaComprobantesPage;
    kardexApi: KardexApi;
};

export const test = base.extend<GuiasFixtures>({
    cajero: async ({page}, use) => {
        const actor = Cajero.con(page);
        await use(actor);
    },

    listadoGuiasPage: async ({page}, use) => {
        await use(new ListadoGuiasPage(page));
    },

    busquedaComprobantes: async ({page}, use) => {
        await use(new BusquedaComprobantesPage(page));
    },

    kardexApi: async ({request, page}, use) => {
        const token = await getCachedToken(page);
        const almacenesApi = new AlmacenesApi(request, token);
        const almacenesQuery = await almacenesApi.buildAlmacenesQuery();
        await use(new KardexApi(request, token, almacenesQuery));
    }
});

export {expect} from '@playwright/test';
