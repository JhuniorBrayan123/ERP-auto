import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, EXCEL_MASIVOS, ITEMS_TEST, PATRON_CODIGO,} from '@helpers/Logistica/movimiento-data.helper';
import {
    abrirYCerrarBitacora,
    cargarMovimientoMasivoDesdeExcel,
    verificarstockmasivo,
} from '@helpers/Logistica/verificaciones-movimientos.helper';
import * as path from 'path';


test.describe('MS-7 | Movimientos Masivos @masivos', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 34: Registrar movimiento masivo correctamente
    // ═══════════════════════════════════════════════════════════════
    test('Registrar movimiento masivo correctamente @MS-7', async ({
                                                                       movimientosNav,
                                                                       listadoMovimientos,
                                                                       stockVerificacion,
                                                                       kardexVerificacion,
                                                                       movimientoRapido,
                                                                       page,
                                                                   }) => {

        const excelPath = path.resolve(__dirname, '../../../../src/data', EXCEL_MASIVOS.INGRESOS);
        await test.step('Given: navegar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });
        await cargarMovimientoMasivoDesdeExcel(listadoMovimientos, movimientoRapido, page, excelPath);
        await abrirYCerrarBitacora(listadoMovimientos, true);
        await test.step('And: verificar stock del producto masivo', async () => {
            await verificarstockmasivo(movimientosNav, stockVerificacion, [4, 1]);
        });
        await test.step('And: verificar kardex del producto masivo', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
            await kardexVerificacion.clickVariosNth(0);
            await page.getByRole('row', {name: `1 P Producto ${ITEMS_TEST.MASIVO_PROD.codigo}5 Tippy`}).getByRole('button').click();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 35: Movimiento masivo con productos e insumos
    // ═══════════════════════════════════════════════════════════════
    test('Movimiento masivo con productos e insumos @MS-7', async ({
                                                                       movimientosNav,
                                                                       listadoMovimientos,
                                                                       stockVerificacion,
                                                                       kardexVerificacion,
                                                                       movimientoRapido,
                                                                       page,
                                                                   }) => {

        const excelPath = path.resolve(__dirname, '../../../../src/data', EXCEL_MASIVOS.INGRESOS_INSUMOS);

        await test.step('Given: navegar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });
        await cargarMovimientoMasivoDesdeExcel(listadoMovimientos, movimientoRapido, page, excelPath);
        await abrirYCerrarBitacora(listadoMovimientos, false);
        await test.step('And: verificar stock del producto', async () => {
            await verificarstockmasivo(movimientosNav, stockVerificacion);
        });
        await test.step('And: verificar kardex del insumo', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_INSUMO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
            await expect(page.getByText(PATRON_CODIGO.INGRESO).first()).toBeVisible();
            await kardexVerificacion.cerrarModalDetalle();
        });
    });
});
