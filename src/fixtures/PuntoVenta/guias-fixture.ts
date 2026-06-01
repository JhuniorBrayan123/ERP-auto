import {test as base} from '@playwright/test';
import {Cajero} from '../../actors/cajero';
import {ListadoGuiasPage} from '@pages/PuntoVenta/guias-remision/ListadoGuiasPage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

type GuiasFixtures = {
    cajero: Cajero;
    listadoGuiasPage: ListadoGuiasPage;
    busquedaComprobantes: BusquedaComprobantesPage;
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
    }
});

export {expect} from '@playwright/test';
