import {
    crearBoletaSemilla,
    expect,
    resolveActiveStorageState,
    resolveBaseUrl,
    test
} from '@fixtures/PuntoVenta/busqueda-comprobantes.fixture';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {BC_CATEGORIAS, BC_PRESETS_FECHA, BC_TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {CLIENTES} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

let semilla: ComprobanteInfo;

test.beforeAll(async ({browser}) => {
    const context = await browser.newContext({
        storageState: resolveActiveStorageState(),
        baseURL: resolveBaseUrl(),
    });
    const page = await context.newPage();
    try {
        semilla = await crearBoletaSemilla(page);
        await page.goto('/punto-venta/comprobantes');
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.activarTodasLasColumnas();
    } finally {
        await context.close();
    }
});

test.beforeEach(async ({page}) => {
    await page.goto('/punto-venta/comprobantes');
});

test('BC-02 | Buscar comprobantes por rango de fechas — Hoy', async ({busquedaPage}) => {
    await test.step('Given: el usuario está en la pantalla de búsqueda', async () => {
    });
    await test.step('When: selecciona el preset "Hoy" y aplica filtros', async () => {
        await busquedaPage.filtrarPorRangoFecha(BC_PRESETS_FECHA.HOY);
    });
    await test.step('Then: la grilla muestra comprobantes con estado visible', async () => {
        await expect(busquedaPage['page'].locator('tbody tr').first()).toBeVisible({timeout: 15_000});
    });
});

test('BC-02b | Buscar comprobantes por rango de fechas — Últimos 7 días', async ({busquedaPage}) => {
    await test.step('When: selecciona preset "Últimos 7 días" y aplica', async () => {
        await busquedaPage.filtrarPorRangoFecha(BC_PRESETS_FECHA.SIETE);
    });

    await test.step('Then: la grilla muestra resultados del período', async () => {
        await expect(busquedaPage['page'].locator('tbody tr').first()).toBeVisible({timeout: 15_000});
    });
});

test('BC-03 | Buscar comprobantes por tipo — Boleta', async ({busquedaPage}) => {
    await test.step('Given: el usuario selecciona la categoría Ventas', async () => {
        await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
    });

    await test.step('When: abre filtros avanzados y selecciona tipo Boleta', async () => {
        await busquedaPage.abrirFiltrosAvanzados();
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
    });

    await test.step('Then: la grilla solo muestra comprobantes de tipo BOLETA DE VENTA', async () => {
        const page = busquedaPage['page'];
        await expect(page.locator('tbody').first()).toContainText('BOLETA DE VENTA', {timeout: 15_000});
        await expect(page.locator('tbody').first()).not.toContainText('FACTURA');
    });
});

test('BC-04 | Buscar comprobante por serie y correlativo (semilla)', async ({busquedaPage}) => {
    test.skip(!semilla, 'Semilla no disponible — el beforeAll puede haber fallado');

    await test.step('Given: el usuario está en categoría Ventas con filtros avanzados', async () => {
        await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
        await busquedaPage.abrirFiltrosAvanzados();
    });

    await test.step('When: filtra por tipo Boleta, serie y correlativo de la semilla', async () => {
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
        await busquedaPage.filtrarPorSerie(semilla.serie);
        await busquedaPage.filtrarPorCorrelativos(semilla.correlativo);
    });

    await test.step('Then: la grilla muestra exactamente el comprobante semilla', async () => {
        const fila = busquedaPage.obtenerFilaPorNumero(semilla.numeroCompleto);
        await expect(fila).toBeVisible({timeout: 15_000});
    });

    await test.step('And: la bitácora del comprobante tiene entradas de inventario y financiero', async () => {
        await busquedaPage.abrirAccionesDeComprobante(semilla.numeroCompleto);
        await busquedaPage.abrirBitacora();
        await expect(busquedaPage['page'].getByText('Descargo de Inventarios')).toBeVisible({timeout: 20_000});
        await expect(busquedaPage['page'].getByText('Comprobante Financiero Emitido')).toBeVisible();
        await busquedaPage.cerrarBitacora();
    });
});

test('BC-05 | Buscar comprobantes por nombre de cliente', async ({busquedaPage}) => {
    test.skip(!semilla, 'Semilla no disponible');

    await test.step('Given: el usuario está en Ventas con filtros avanzados', async () => {
        await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
        await busquedaPage.abrirFiltrosAvanzados();
    });

    await test.step('When: filtra por nombre parcial del cliente de la semilla', async () => {
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
        
        const nombreParcial = semilla.cliente.split(' ')[0];
        await busquedaPage.filtrarPorNombreCliente(nombreParcial);
    });

    await test.step('Then: la grilla muestra comprobantes del cliente', async () => {
        const page = busquedaPage['page'];
        await expect(page.locator('tbody').first()).toContainText(semilla.cliente, {timeout: 15_000});
        
        await expect(page.locator('tbody').first()).toContainText(semilla.correlativo.replace(/^0+/, ''));
    });
});

test('BC-05b | Buscar comprobantes por número de documento del cliente (RUC)', async ({busquedaPage}) => {
    await test.step('Given: el usuario abre filtros avanzados en categoría Ventas', async () => {
        await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
        await busquedaPage.abrirFiltrosAvanzados();
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.FACTURA);
    });

    await test.step('When: ingresa el RUC del cliente empresa', async () => {
        await busquedaPage.filtrarPorNumDocCliente(CLIENTES.EMPRESA_RUC_AUTO.documento);
    });

    await test.step('Then: la grilla muestra facturas del cliente RUC', async () => {
        const page = busquedaPage['page'];
        await expect(page.locator('tbody').first()).toContainText('FACTURA', {timeout: 15_000});
    });
});
test('BC-06 | Buscar comprobantes combinando tipo + documento de cliente', async ({busquedaPage}) => {
    await test.step('Given: filtros avanzados abiertos', async () => {
        await busquedaPage.abrirFiltrosAvanzados();
    });

    await test.step('When: selecciona tipo Factura y filtra por RUC', async () => {
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.FACTURA);
        await busquedaPage.filtrarPorNumDocCliente(CLIENTES.EMPRESA_RUC_AUTO.documento);
    });

    await test.step('Then: la grilla muestra solo facturas del cliente RUC', async () => {
        const page = busquedaPage['page'];
        await expect(page.locator('tbody').first()).toContainText('FACTURA', {timeout: 15_000});
        
        await expect(page.locator('tbody').first()).toContainText(CLIENTES.EMPRESA_RUC_AUTO.nombre);
    });
});

test('BC-07 | Buscar comprobantes sin resultados (correlativo inexistente)', async ({busquedaPage}) => {
    await test.step('Given: filtros avanzados abiertos', async () => {
        await busquedaPage.abrirFiltrosAvanzados();
    });

    await test.step('When: ingresa un correlativo que no existe en el sistema', async () => {
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.COTIZACION);
        await busquedaPage.filtrarPorCorrelativos('9999999999');
    });

    await test.step('Then: la grilla muestra mensaje de sin resultados', async () => {
        await busquedaPage.validarSinResultados();
    });

    await test.step('And: no se muestran datos de búsquedas anteriores', async () => {
        const filas = await busquedaPage['page'].locator('tbody tr').count();
        expect(filas).toBeLessThanOrEqual(1);
    });
});

test('BC-08 | Limpiar filtros de búsqueda restablece el estado inicial', async ({busquedaPage}) => {
    const page = busquedaPage['page'];

    await test.step('Given: el usuario aplica múltiples filtros', async () => {
        await busquedaPage.abrirFiltrosAvanzados();
        await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.FACTURA);
        await busquedaPage.filtrarPorMoneda('Dólares americanos');
    });

    await test.step('When: hace click en "Borrar filtros"', async () => {
        await busquedaPage.borrarFiltros();
    });

    await test.step('Then: el campo de tipo de comprobante queda vacío', async () => {
        const tipoFiltro = page.getByText('Factura', {exact: true});
        await expect(tipoFiltro).not.toBeVisible({timeout: 5_000});
    });

    await test.step('And: la grilla muestra resultados sin filtro aplicado', async () => {
        await expect(page.locator('tbody tr').first()).toBeVisible({timeout: 15_000});
    });
});
