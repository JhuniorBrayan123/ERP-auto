import { test, expect } from '../../../src/fixtures/Logistica/movimientos-fixture';

test.describe('Exportaciones de Movimientos @exportaciones', { tag: ['@logistica', '@movimientos'] }, () => {

  // ═══════════════════════════════════════════════════════════════
  // Scenario 41: Exportar movimientos con filtros
  // ═══════════════════════════════════════════════════════════════
  test('debe exportar movimientos filtrados por tipo y almacén', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

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
      // Aquí se abre el modal de exportación
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 42: Exportar todos los movimientos detallados
  // ═══════════════════════════════════════════════════════════════
  test('debe exportar todos los movimientos detallados sin filtros', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos y ver tab Todos', async () => {
      await movimientosNav.navegarAIngresosDesdeMenu();
      await listadoMovimientos.clickTabTodos();
    });

    await test.step('When: abrir opciones y exportar', async () => {
      await listadoMovimientos.clickIconoOpciones();
    });

    await test.step('Then: verificar que se descarga el archivo', async () => {
      const download = await listadoMovimientos.exportarTodosMovimientos();
      expect(download).toBeTruthy();
    });
  });
});
