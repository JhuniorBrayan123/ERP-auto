import {test} from '../../fixtures/Logistica/edicion-clonado-fixture';
import {expect, Page} from '@playwright/test';
import type {EdicionItemPage} from '../../pages/Logistica/EdicionItemPage';
import type {ListaItemsPage} from '../../pages/Logistica/ListaItemsPage';
import type {ItemDetailPage} from '../../pages/Logistica/ItemDetailPage';

// ─── PS-4 Edición de Item ────────────────────────────────────────────

/**
 * Confirmar actualización de item: clickActualizarProducto + closeSuccessModal.
 * Repetido en 3/3 tests de PS-4.
 */
export const confirmarActualizacionItem = async (
    edicionItem: EdicionItemPage,
) => {
    await test.step('Confirmar actualización', async () => {
        await edicionItem.clickActualizarProducto();
        await edicionItem.closeSuccessModal();
    });
};

/**
 * Buscar item por código en la lista y abrir Ver Ítem desde el menú de acciones.
 * Repetido en 3/3 tests de PS-4.
 */
export const buscarYVerItemDesdeListado = async (
    listaItems: ListaItemsPage,
    itemDetail: ItemDetailPage,
    codigoItem: string,
) => {
    await test.step('Buscar item y abrir Ver Ítem', async () => {
        await listaItems.searchByCode(codigoItem);
        await itemDetail.abrirMenuAccionesItem();
        await itemDetail.clickVerItem();
    });
};

// ─── PS-6 Actualización Masiva Items ─────────────────────────────────

/**
 * Verificar item actualizado en detalle: ir al inicio → buscar → ver item → verificar nombre → bitácora → atrás.
 * Repetido en 3/3 tests de PS-6.
 */
export const verificarItemActualizadoEnDetalle = async (
    page: Page,
    actualizacionMasiva: any,
    listaItems: ListaItemsPage,
    itemDetail: ItemDetailPage,
    primerCodigo: string,
    primerNombreEditado: string,
    verificarContenidoBitacora: boolean = false,
) => {
    await test.step('Ver ítem: nombre en detalle y tab Bitácora', async () => {
        await actualizacionMasiva.clickIrAlInicio();
        await listaItems.searchByCode(primerCodigo);
        await page.waitForFunction(
            (codigo) => {
                const filas = document.querySelectorAll('table tbody tr, .item-row, [class*="row"]');
                return Array.from(filas).some(f => f.textContent?.includes(codigo));
            },
            primerCodigo,
            {timeout: 20_000}
        )
        await itemDetail.abrirMenuAccionesItem();
        await itemDetail.clickVerItem();
        await expect(page.getByText(primerNombreEditado).first()).toBeVisible({
            timeout: 30_000,
        });
        await itemDetail.irATabBitacoraPorTexto();
        if (verificarContenidoBitacora) {
            await expect(
                page.locator('.bitacora, [class*="bitacora"]').first(),
            ).toContainText(primerNombreEditado, {timeout: 45_000});
        }
        await itemDetail.clickAtras();
    });
};
