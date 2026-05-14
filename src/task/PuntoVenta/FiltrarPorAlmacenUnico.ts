import {Page} from "playwright/test"
import {ItemVenta} from "@helpers/PuntoVenta/emision.types";
import {EmisionPage} from "@pages/PuntoVenta/EmisionPage";

export const FiltrarBuscarYVerificarItem = (almacenDestino: string, item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        // Abrir el dropdown
        await page.locator('.control.almacen .v-select-base-header').click();
        // Seleccionar la opción deseada
        await page.locator('.v-select-small-option')
            .filter({hasText: almacenDestino})
            .click();
        await emision.seleccionarItem(item.codigo);
    };
