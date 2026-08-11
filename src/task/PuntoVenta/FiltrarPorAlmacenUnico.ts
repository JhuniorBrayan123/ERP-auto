import {Page} from "playwright/test"
import {ItemVenta} from "@helpers/PuntoVenta/emision.types";
import {EmisionPage} from "@pages/PuntoVenta/EmisionPage";
import {esperarDebounce} from "@utils/wait-helpers";

export const FiltrarBuscarYVerificarItem = (almacenDestino: string, item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.locator('.control.almacen .v-select-base-header').click();
        await page.locator('.v-select-small-option')
            .filter({hasText: almacenDestino})
            .click();
        
        await esperarDebounce(page, 1000, 'Cambio de almacén');

        await emision.buscarItem(item.codigo);
    };
