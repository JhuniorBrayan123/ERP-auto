import {test} from '../../fixtures/Logistica/movimientos-fixture';
import {Page} from '@playwright/test';
import {MovimientosNavigationPage} from '../../pages/Logistica/MovimientosNavigationPage';
import {StockVerificacionPage} from '../../pages/Logistica/StockVerificacionPage';
import {KardexVerificacionPage} from '../../pages/Logistica/KardexVerificacionPage';
import {RegistroMovimientoPage} from '../../pages/Logistica/RegistroMovimientoPage';
import {ResultadoMovimientoPage} from '../../pages/Logistica/ResultadoMovimientoPage';

/**
 * Helper para encapsular las verificaciones repetitivas de Stock y Kardex
 * en los módulos de Movimientos de Logística.
 */
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
    await test.step('Then: verificar stock actualizado', async () => {
        await movimientosNav.navegarAStockProductos();
        await stockVerificacion.buscarPorCodigo(codigoItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
        await stockVerificacion.clickVariosTexto();
    });

    await test.step('And: verificar movimiento en kardex', async () => {
        await movimientosNav.navegarAKardexTotal();
        await page.waitForTimeout(2000); // Dar respiro al backend
        await kardexVerificacion.buscarPorCodigo(codigoItem);
        if (textClickEquivalente) {
            await page.getByText(textClickEquivalente).click();
        }
        await kardexVerificacion.clickVariosTexto();
        await kardexVerificacion.clickKardexPorProducto();
        await kardexVerificacion.abrirVerDetallePorAlmacen2(almacen);
        await kardexVerificacion.expectPatronCodigoMovimientoVisible(patronCodigoVisible);
        await kardexVerificacion.cerrarModalDetalle();
    });
};
/**
 * Encapsula el step repetitivo de buscar y seleccionar un ítem en ajustes.
 */
export const crearAjusteConItem = async (
    registroMovimiento: RegistroMovimientoPage,
    codigoItem: string,
    nombreItem: string,
) => {
    await test.step('When: crear ajuste con ítem', async () => {
        await registroMovimiento.clickAgregarAjuste();
        await registroMovimiento.buscarItem(codigoItem);
        await registroMovimiento.seleccionarItemEnResultados(nombreItem);
    });
};

/**
 * Encapsula el step repetitivo de registrar el ajuste e ir al listado.
 */
export const registrarAjusteEIrAlListado = async (
    registroMovimiento: RegistroMovimientoPage,
    resultadoMovimiento: ResultadoMovimientoPage,
) => {
    await test.step('And: registrar ajuste', async () => {
        await registroMovimiento.clickRegistrarAjuste();
        await resultadoMovimiento.irAlListado();
    });
};
/**
 * Encapsula el step repetitivo de definir cantidad y factor de ajuste.
 */
export const definirCantidadYFactor = async (
    registroMovimiento: RegistroMovimientoPage,
    cantidad: string,
    factor: 'Agregar' | 'Quitar',
) => {
    await test.step(`And: definir cantidad y factor ${factor}`, async () => {
        await registroMovimiento.llenarCantidad(cantidad);
        await registroMovimiento.seleccionarFactorAjuste(factor);
    });
};

