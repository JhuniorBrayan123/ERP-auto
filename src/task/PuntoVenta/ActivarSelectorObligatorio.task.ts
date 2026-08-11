import {Page} from '@playwright/test';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import {EdicionItemPage} from '@pages/Logistica/EdicionItemPage';

export const ActivarSelectorObligatorio = (codigoItem: string) => {
    const fn = async (page: Page): Promise<void> => {
        
        await page.goto('/')
        await page.getByText('Productos y servicios').click();
        await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
        const listaItemsPage = new ListaItemsPage(page);
        await listaItemsPage.searchAndEdit(codigoItem);

        const edicionItemPage = new EdicionItemPage(page);
        await edicionItemPage.goToSelectoresTab();

        const changed = await edicionItemPage.setSelectorObligatorioSwitch();

        if (changed) {
            await edicionItemPage.clickActualizarProducto();
            await edicionItemPage.closeSuccessModal();
        } else {

            await edicionItemPage.clickActualizarProducto();
        }
    };
    fn.displayName = 'Activar selector obligatorio';
    return fn;
};
