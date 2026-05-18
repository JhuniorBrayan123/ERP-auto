/**
 * Helpers de verificación de kardex total y desde stock.
 * Extraído de verificaciones-movimientos.helper.ts
 */
import {Page} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';
import {StockVerificacionPage} from '@pages/Logistica/StockVerificacionPage';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {expectVisibleFunctional, runFunctionalStep} from '@utils/functional-step';

export const verificarKardexTotalEstandar = async (
    movimientosNav: MovimientosNavigationPage,
    kardexVerificacion: KardexVerificacionPage,
    page: Page,
    codigoItem: string,
    almacen: string,
    patronCodigoVisible: RegExp,
    accionAdicionalBotonOpcion?: () => Promise<void>
) => {
    await runFunctionalStep(
        'Verificar kardex total del movimiento',
        page,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex total',
            userMessage: 'No se pudo verificar el movimiento esperado en kardex total.',
            technicalDetail: 'Falla en búsqueda, selección de opción kardex o apertura de detalle por almacén.',
        },
        async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(codigoItem);
            if (accionAdicionalBotonOpcion) {
                await accionAdicionalBotonOpcion();
            } else {
                await kardexVerificacion.clickVariosTexto(codigoItem);
            }
            await kardexVerificacion.clickKardexPorProducto(codigoItem);
            await kardexVerificacion.abrirVerDetallePorAlmacen2(almacen);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(patronCodigoVisible);
            await kardexVerificacion.cerrarModalDetalle();
        },
    );
};

export const verificarKardexDesdeStock = async (
    stockVerificacion: StockVerificacionPage,
    almacen: string,
    patronCodigo: RegExp,
    clickCodigo: boolean = false,
) => {
    await runFunctionalStep(
        'Verificar movimiento en kardex desde stock',
        undefined,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex desde la vista de stock',
            userMessage: 'No se pudo validar el movimiento en kardex desde la vista de stock.',
            technicalDetail: 'Falla al abrir kardex, abrir detalle por almacén o validar código de movimiento.',
        },
        async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPopup.abrirVerDetallePorAlmacen2(almacen);
            await expectVisibleFunctional(kardexPage, kardexPage.getByText(patronCodigo).first(), {
                ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
                flowStep: 'Confirmar código de movimiento visible en kardex',
                userMessage: 'No se visualizó el código de movimiento esperado en kardex.',
                technicalDetail: `El patrón ${patronCodigo} no estuvo visible en el detalle de kardex.`,
            });
            if (clickCodigo) {
                await kardexPopup.clickCodigoMovimientoRegex(patronCodigo);
            }
            await kardexPopup.cerrarModalDetalle();
        },
    );
};
