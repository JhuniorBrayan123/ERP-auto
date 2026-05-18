import {Page} from "playwright/test"
import {ItemVenta} from "@helpers/PuntoVenta/emision.types";
import {EmisionPage} from "@pages/PuntoVenta/EmisionPage";
import {esperarDebounce} from "@utils/wait-helpers";

export const FiltrarBuscarYVerificarItem = (almacenDestino: string, item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        // Abrir el dropdown
        await page.locator('.control.almacen .v-select-base-header').click();
        // Seleccionar la opción deseada
        await page.locator('.v-select-small-option')
            .filter({hasText: almacenDestino})
            .click();
        
        await esperarDebounce(page, 1000, 'Cambio de almacén');
        
        // El test SC-01 verifica si el ítem es visible en la grilla para ese almacén.
        // No debemos seleccionarlo (darle click), solo buscarlo.
        await emision.buscarItem(item.codigo);
    };
