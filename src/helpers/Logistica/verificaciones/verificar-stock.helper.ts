import {Page} from '@playwright/test';
import {MovimientosNavigationPage} from '@pages/Logistica/MovimientosNavigationPage';
import {StockVerificacionPage} from '@pages/Logistica/StockVerificacionPage';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';
import {ITEMS_TEST} from '../movimiento-data.helper';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {runFunctionalStep} from '@utils/functional-step';

export const verificarStockYKardex = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    kardexVerificacion: KardexVerificacionPage,
    page: Page,
    codigoItem: string,
    almacen: string,
    patronCodigoVisible: RegExp,
    textClickEquivalente?: string
) => {
    await runFunctionalStep(
        'Verificar stock actualizado en inventario',
        page,
        FUNCTIONAL_CATALOG.stock.buscarProducto,
        async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(codigoItem);
            if (textClickEquivalente) {
                await page.getByText(textClickEquivalente).click();
            }
            await stockVerificacion.clickVariosTexto();
        },
    );

    await runFunctionalStep(
        'Verificar movimiento reflejado en kardex',
        page,
        {
            ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
            flowStep: 'Validar movimiento en kardex por almacén',
            userMessage: 'El flujo no logró confirmar el movimiento en la vista de kardex.',
            technicalDetail: 'Falla al abrir kardex por producto, abrir detalle de almacén o validar el código de movimiento.',
        },
        async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(codigoItem);
            if (textClickEquivalente) {
                await page.getByText(textClickEquivalente).click();
            }
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(almacen);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(patronCodigoVisible);
            await kardexVerificacion.cerrarModalDetalle();
        },
    );
};

export const verificarStockPorCodigoYClick = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    codigoItem: string,
    accionAdicional?: () => Promise<void>
) => {
    await runFunctionalStep('Verificar stock del producto', undefined, FUNCTIONAL_CATALOG.stock.buscarProducto, async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(codigoItem);
        if (accionAdicional) {
            await accionAdicional();
        } else {
            await stockVerificacion.clickVariosTexto();
        }
    });
};

export const verificarStockMasivo = async (
    movimientosNav: MovimientosNavigationPage,
    stockVerificacion: StockVerificacionPage,
    nthClicks: number[] = [0],
) => {
    await runFunctionalStep('Verificar stock del producto masivo', undefined, FUNCTIONAL_CATALOG.stock.buscarProducto, async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
        for (const nth of nthClicks) {
            await stockVerificacion.clickAlmacenMultipleNth(nth);
        }
    });
};
