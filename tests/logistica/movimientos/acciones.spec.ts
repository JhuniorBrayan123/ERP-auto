import { test, expect } from '@fixtures/Logistica/movimientos-fixture';
import { DATOS_CONTACTO } from '@helpers/Logistica/movimiento-data.helper';

test.describe('Acciones de Movimientos @acciones', { tag: ['@logistica', '@movimientos'] }, () => {

  // ═══════════════════════════════════════════════════════════════
  // Scenario 36: Imprimir movimiento A4
  // ═══════════════════════════════════════════════════════════════
  test('debe imprimir movimiento en formato A4 desde la lista', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos y ir al tab Todos', async () => {
      await movimientosNav.navegarAIngresos();
      await listadoMovimientos.clickTabPorIndice(0);
    });

    await test.step('When: abrir menú de acciones y seleccionar Imprimir', async () => {
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickImprimirDescargarEnviar();
    });

    await test.step('Then: click en imprimir A4', async () => {
      await listadoMovimientos.imprimirA4DesdeLista();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 37: Imprimir movimiento Ticket
  // ═══════════════════════════════════════════════════════════════
  test('debe imprimir movimiento en formato Ticket desde la lista', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos y ir al tab Todos', async () => {
      await movimientosNav.navegarAIngresos();
      await listadoMovimientos.clickTabPorIndice(0);
    });

    await test.step('When: abrir acciones y seleccionar Imprimir', async () => {
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickImprimirDescargarEnviar();
    });

    await test.step('Then: click en imprimir Ticket', async () => {
      await listadoMovimientos.imprimirTicketDesdeLista();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 38: Enviar movimiento por WhatsApp
  // ═══════════════════════════════════════════════════════════════
  test('debe enviar movimiento por WhatsApp desde la lista', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos', async () => {
      await movimientosNav.navegarAIngresos();
      await listadoMovimientos.clickTabPorIndice(0);
    });

    await test.step('When: abrir acciones y enviar por WhatsApp', async () => {
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickImprimirDescargarEnviar();
    });

    await test.step('Then: llenar teléfono y enviar', async () => {
      const popup = await listadoMovimientos.enviarWhatsAppDesdeLista(DATOS_CONTACTO.TELEFONO);
      expect(popup).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 39: Enviar movimiento por Email
  // ═══════════════════════════════════════════════════════════════
  test('debe enviar movimiento por Email desde la lista', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos', async () => {
      await movimientosNav.navegarAIngresos();
      await listadoMovimientos.clickTabPorIndice(0);
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickImprimirDescargarEnviar();
    });

    await test.step('When: enviar por Email', async () => {
      await listadoMovimientos.enviarEmailDesdeLista(DATOS_CONTACTO.EMAIL);
    });

    await test.step('Then: cerrar modal', async () => {
      await listadoMovimientos.cerrarModal();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 40: Descargar PDF de movimiento
  // ═══════════════════════════════════════════════════════════════
  test('debe descargar PDF de un movimiento desde la lista', async ({
    movimientosNav,
    listadoMovimientos,
    page,
  }) => {

    await test.step('Given: navegar a Ingresos', async () => {
      await movimientosNav.navegarAIngresosDesdeMenu();
      await listadoMovimientos.clickTabPorIndice(0);
    });

    await test.step('When: abrir acciones y descargar PDF', async () => {
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickImprimirDescargarEnviar();
    });

    await test.step('Then: verificar que se descarga el PDF', async () => {
      const download = await listadoMovimientos.descargarPDFDesdeLista();
      expect(download).toBeTruthy();
    });
  });
});
