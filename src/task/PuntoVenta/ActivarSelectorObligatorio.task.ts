// 📁 src/task/PuntoVenta/ActivarSelectorObligatorio.task.ts
// SC-14 setup: Navega a Productos → edita item → activa switch Obligatorio (idempotente)
import {Page} from '@playwright/test';
import {ListaItemsPage} from '@pages/Logistica/ListaItemsPage';
import {EdicionItemPage} from '@pages/Logistica/EdicionItemPage';

export const ActivarSelectorObligatorio = (codigoItem: string) => {
    const fn = async (page: Page): Promise<void> => {
        // Navegar a Productos y servicios
        await page.goto('/')
        await page.getByText('Productos y servicios').click();
        await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
        const listaItemsPage = new ListaItemsPage(page);
        await listaItemsPage.searchAndEdit(codigoItem);

        const edicionItemPage = new EdicionItemPage(page);
        await edicionItemPage.goToSelectoresTab();

        // Activar switch Obligatorio (idempotente: si ya está activo no cambia nada)
        const changed = await edicionItemPage.setSelectorObligatorioSwitch();

        // Guardar cambios solo si se activó el switch
        if (changed) {
            await edicionItemPage.clickActualizarProducto();
            await edicionItemPage.closeSuccessModal();
        } else {
            // Si no hubo cambios, simplemente regresamos a la lista o cerramos el modal si aplica
            // En este caso, ya podemos salir de la tarea porque la data es correcta.
            await edicionItemPage.clickActualizarProducto();
        }
    };
    fn.displayName = 'Activar selector obligatorio';
    return fn;
};
