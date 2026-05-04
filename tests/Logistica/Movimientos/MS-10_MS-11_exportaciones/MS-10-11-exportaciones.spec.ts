import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {Download} from "@playwright/test";

test.describe('MS-10-11 | Exportaciones de Movimientos @exportaciones', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 41: Exportar movimientos con filtros
    // ═══════════════════════════════════════════════════════════════
    test('Exportar movimientos con filtros @MS-10-11', async ({
                                                                  movimientosNav,
                                                                  listadoMovimientos,
                                                                  page,
                                                              }) => {

        let download: Download;
        await test.step('Given: navegar a Ingresos y ver tab Todos', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await listadoMovimientos.clickTabTodos();
        });

        await test.step('When: aplicar filtros avanzados', async () => {
            await listadoMovimientos.clickIconoOpciones();
            await listadoMovimientos.abrirFiltrosAvanzados();
            await listadoMovimientos.filtrarPorTipoMov('SALIDA');
            await page.getByText('SALIDA').nth(2).click();
            await listadoMovimientos.filtrarPorAlmacen('ALMACÉN DE VENTAS');
        });

        await test.step('Then: verificar que se pueden exportar los filtrados', async () => {
            await listadoMovimientos.clickIconoOpciones();
            download = await listadoMovimientos.exportarfiltrados()
            // Aquí se abre el modal de exportación
        });
        await test.step('Then: verificar que se descarga el archivo', async () => {
            expect(download).toBeTruthy();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 42: Exportar todos los movimientos detallados
    // ═══════════════════════════════════════════════════════════════
    test('Exportar todos los movimientos detallados @MS-10-11', async ({
                                                                           movimientosNav,
                                                                           listadoMovimientos,
                                                                           page,
                                                                       }) => {

        let download: Download;
        await test.step('Given: navegar a Ingresos y ver tab Todos', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await listadoMovimientos.clickTabTodos();
        });
        await test.step('When: abrir opciones y exportar', async () => {
            await listadoMovimientos.clickIconoOpciones();
            download = await listadoMovimientos.exportarTodosMovimientos();
        });
        await test.step('Then: verificar que se descarga el archivo', async () => {
            expect(download).toBeTruthy();
        });
    });
});
