import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, EXCEL_MASIVOS, ITEMS_TEST, PATRON_CODIGO,} from '@helpers/Logistica/movimiento-data.helper';
import * as path from 'path';

test.describe('Movimientos Masivos @masivos', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 34: Registrar movimiento masivo correctamente
    // ═══════════════════════════════════════════════════════════════
    test('debe procesar movimiento masivo de ingresos desde excel', async ({
                                                                               movimientosNav,
                                                                               listadoMovimientos,
                                                                               stockVerificacion,
                                                                               kardexVerificacion,
                                                                               movimientoRapido,
                                                                               page,
                                                                           }) => {

        const excelPath = path.resolve(__dirname, '../../../src/data', EXCEL_MASIVOS.INGRESOS);

        await test.step('Given: navegar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });

        await test.step('When: abrir menú de opciones y seleccionar carga desde excel', async () => {
            await listadoMovimientos.clickIconoOpciones();
            await listadoMovimientos.clickCrearDesdeExcel();
            await page.locator('.popup-container > .button-close > .icon').click();
        });

        await test.step('And: seleccionar tipo Ingreso y avanzar', async () => {
            await movimientoRapido.seleccionarcardProductos();
            await page.getByText('Siguiente').click();
        });

        await test.step('And: subir archivo excel', async () => {
            await page.locator('input[type="file"]').setInputFiles(excelPath);
            await page.getByText('Siguiente').click();
        });

        await test.step('And: procesar la carga', async () => {
            await page.getByText('Procesar').click();
            await expect(page.getByRole('button', {name: 'Ir al inicio'})).toBeVisible({timeout: 30_000});
            await page.getByRole('button', {name: 'Ir al inicio'}).click();
        });

        await test.step('Then: verificar bitácora del movimiento creado', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.cerrarBitacoraAlternativo();
        });

        await test.step('And: verificar stock del producto masivo', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
            await stockVerificacion.clickAlmacenMultipleNth(4);
            await stockVerificacion.clickAlmacenMultipleNth(1);
        });

        await test.step('And: verificar kardex del producto masivo', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
            await kardexVerificacion.clickVariosNth(0);
            await page.getByRole('row', {name: `1 P Producto ${ITEMS_TEST.MASIVO_PROD.codigo}5 Tippy`}).getByRole('button').click();
            // await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            // await expect(page.getByText(PATRON_CODIGO.INGRESO).first()).toBeVisible();
            // await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 35: Movimiento masivo con productos e insumos
    // ═══════════════════════════════════════════════════════════════
    test('debe procesar movimiento masivo con productos e insumos', async ({
                                                                               movimientosNav,
                                                                               listadoMovimientos,
                                                                               stockVerificacion,
                                                                               kardexVerificacion,
                                                                               movimientoRapido,
                                                                               page,
                                                                           }) => {

        const excelPath = path.resolve(__dirname, '../../../src/data', EXCEL_MASIVOS.INGRESOS_INSUMOS);

        await test.step('Given: navegar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });

        await test.step('When: abrir carga masiva y subir excel con productos e insumos', async () => {
            await listadoMovimientos.clickIconoOpciones();
            await listadoMovimientos.clickCrearDesdeExcel();
            await page.locator('.popup-container > .button-close > .icon').click();
            await movimientoRapido.seleccionarcardProductos();
            await page.getByText('Siguiente').click();
            await page.locator('input[type="file"]').setInputFiles(excelPath);
            await page.getByText('Siguiente').click();
        });

        await test.step('And: procesar la carga', async () => {
            await page.getByText('Procesar').click();
            await expect(page.getByRole('button', {name: 'Ir al inicio'})).toBeVisible({timeout: 30_000});
            await page.getByRole('button', {name: 'Ir al inicio'}).click();
        });

        await test.step('Then: verificar bitácora', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.cerrarBitacora();
        });

        await test.step('And: verificar stock del producto', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_PROD.codigo);
            await stockVerificacion.clickAlmacenMultipleNth(0);
        });

        await test.step('And: verificar kardex del insumo', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.MASIVO_INSUMO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await page.getByText('ALMACÉN DE VENTASSaldo').click();
            await page.getByText('ALMACÉN DE VENTASSaldo').click();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
            await expect(page.getByText(PATRON_CODIGO.INGRESO).first()).toBeVisible();
            await kardexVerificacion.cerrarModalDetalle();
        });
    });
});
