import {
    crearBoletaConDatosOpcionales,
    expect,
    resolveActiveStorageState,
    resolveBaseUrl,
    test
} from '@fixtures/PuntoVenta/busqueda-comprobantes.fixture';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {BC_ACCIONES, BC_CATEGORIAS, BC_TIPOS_COMPROBANTE,} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {CAJAS, CLIENTES, ITEMS_PV,} from '@helpers/PuntoVenta/emision-data.helper';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {Page} from "@playwright/test";


test.describe('BC-18 | Abrir emisión de Factura desde NV', {tag: ['@busqueda']}, () => {
    let semillaNV: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobantePage = new ComprobantePage(page);
            const clientePage = new ClientePage(page);
            const emisionPage = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await cajaPage.asegurarCajaAbierta();

            await comprobantePage.seleccionarNotaVenta();
            await clientePage.seleccionarClienteDNI(
                CLIENTES.PERSONA_DNI.documento,
                `DNIDoc. Nacional de Identidad${CLIENTES.PERSONA_DNI.documento}99999999${CLIENTES.PERSONA_DNI.nombre}`,
            );
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            const emisionNV = await emisionPage.emitirConEfectivoExacto();
            const numeroNV = await postEmision.obtenerCorrelativoDinamico();
            const [serieNV, corrNV] = numeroNV.split('-');
            semillaNV = {
                tipo: 'Nota de venta', serie: serieNV ?? emisionNV.serie,
                correlativo: corrNV ?? emisionNV.correlativo,
                numeroCompleto: numeroNV || `${emisionNV.serie}-${emisionNV.correlativo}`,
                cliente: CLIENTES.PERSONA_DNI.nombre,
            };
            console.log(`[BC-18] Semilla NV creada: ${semillaNV.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Abrir emisión de Factura desde una Nota de Venta @BC-18.1', async ({busquedaPage}) => {
        test.skip(!semillaNV, 'Semilla NV no disponible');

        const page = busquedaPage['page'];

        await test.step('Given: filtrar la Nota de Venta semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.NOTA_VENTA);
            await busquedaPage.filtrarPorCorrelativos(semillaNV.correlativo);
        });

        await test.step('When: abre acciones y selecciona Generar → Factura', async () => {
            await busquedaPage.abrirAccionesDeComprobante(semillaNV.numeroCompleto);
            const popupPage = await busquedaPage.abrirGenerarComprobante(
                BC_TIPOS_COMPROBANTE.FACTURA,
                CAJAS.VENTA.nombre,
            );

            await test.step('Then: la nueva pestaña carga con los datos de la NV de origen', async () => {
                await expect(popupPage.getByRole('main')).toContainText(
                    ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre, {timeout: 20_000},
                );
                await popupPage.close();
            });
        });
    });
});


test.describe('BC-19 y BC-20 | Bitácora y Ver comprobante', {tag: ['@busqueda']}, () => {
    let semillaFactura: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            semillaFactura = await crearBoletaConDatosOpcionales(page);
            console.log(`[BC-19/20] Semilla Boleta con datos opcionales creada: ${semillaFactura.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Consultar bitácora de una boleta emitida @BC-19-20.1', async ({busquedaPage}) => {
        test.skip(!semillaFactura, 'Semilla boleta no disponible');

        await test.step('Given: filtrar la boleta semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
            await busquedaPage.filtrarPorCorrelativos(semillaFactura.correlativo);
        });

        await test.step('When/Then: abrir bitácora y validar eventos del ciclo de vida', async () => {
            await busquedaPage.validarBitacoraContiene(semillaFactura, [
                'Descargo de Inventarios',
                'Comprobante Financiero Emitido',
                'Comprobante Registrado',
                'Comprobante Emitido',
                'PDF Generado',
                'XML Generado',
            ]);
        });
    });

    test('SC-02: Ver comprobante en popup y validar datos opcionales @BC-19-20.2', async ({busquedaPage}) => {
        test.skip(!semillaFactura?.datosOpcionales, 'Semilla con datos opcionales no disponible');

        await test.step('Given: filtrar la boleta semilla', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.VENTAS);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.BOLETA);
            await busquedaPage.filtrarPorCorrelativos(semillaFactura.correlativo);
        });

        await test.step('When/Then: abrir Ver comprobante y validar datos opcionales', async () => {
            await busquedaPage.abrirAccionesDeComprobante(semillaFactura.numeroCompleto);
            const popupPage = await busquedaPage.abrirVerComprobanteDesdeMenu();

            await expect(popupPage.getByText('Boleta electrónica')).toBeVisible({timeout: 30_000});
            await expect(popupPage.locator('body')).toContainText(semillaFactura.numeroCompleto);
            await expect(popupPage.locator('body')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

            await busquedaPage.abrirDatosOpcionalesEnPopup(popupPage);
            await busquedaPage.validarDatosOpcionalesEnPopup(popupPage, semillaFactura.datosOpcionales!);
            await busquedaPage.cerrarDrapePopup(popupPage);

            await popupPage.close();
        });
    });
});
test.describe('BC-21 | Clonar factura', {tag: ['@busqueda']}, () => {
    let semillaParaClonar: ComprobanteInfo;

    test.beforeAll(async ({browser}) => {
        const context = await browser.newContext({
            storageState: resolveActiveStorageState(),
            baseURL: resolveBaseUrl(),
        });
        const page = await context.newPage();
        try {
            const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
            const comprobantePage = new ComprobantePage(page);
            const clientePage = new ClientePage(page);
            const emisionPage = new EmisionPage(page);
            const postEmision = new PostEmisionPage(page);

            await page.goto('/');
            await page.getByText('Ventas y compras').click();
            await page.getByText('Ver cajas').click();
            await cajaPage.asegurarCajaAbierta();

            await comprobantePage.seleccionarFactura();
            await clientePage.seleccionarClienteRUCAuto();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            const emisionF = await emisionPage.emitirConEfectivoExacto();
            const numeroF = await postEmision.obtenerCorrelativoDinamico();
            const [serieF, corrF] = numeroF.split('-');
            semillaParaClonar = {
                tipo: 'Factura', serie: serieF ?? emisionF.serie,
                correlativo: corrF ?? emisionF.correlativo,
                numeroCompleto: numeroF || `${emisionF.serie}-${emisionF.correlativo}`,
                cliente: CLIENTES.EMPRESA_RUC_AUTO.nombre,
            };
            console.log(`[BC-21] Semilla Factura creada: ${semillaParaClonar.numeroCompleto}`);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({page}) => {
        await page.goto('/punto-venta/comprobantes');
    });

    test('SC-01: Clonar una factura y validar que los datos se transfieren @BC-21.1', async ({busquedaPage}) => {
        test.skip(!semillaParaClonar, 'Semilla para clonar no disponible');

        await test.step('Given: filtrar la factura semilla para clonar', async () => {
            await busquedaPage.seleccionarCategoria(BC_CATEGORIAS.FACTURACION);
            await busquedaPage.abrirFiltrosAvanzados();
            await busquedaPage.filtrarPorTipo(BC_TIPOS_COMPROBANTE.FACTURA);
            await busquedaPage.filtrarPorCorrelativos(semillaParaClonar.correlativo);
        });

        let popupPage: Page;

        await test.step('When: abre acciones y selecciona "Clonar comprobante"', async () => {
            await busquedaPage.abrirAccionesDeComprobante(semillaParaClonar.numeroCompleto);
            await busquedaPage.seleccionarAccion(BC_ACCIONES.CLONAR);
            await busquedaPage.seleccionarCajaParaClonar(CAJAS.VENTA.nombre);
            popupPage = await busquedaPage.confirmarClonacion();
        });

        await test.step('Then: el popup de emisión contiene los datos del comprobante origen', async () => {
            await expect(popupPage.getByRole('main')).toContainText(
                CLIENTES.EMPRESA_RUC_AUTO.nombre, {timeout: 30_000},
            );
            await expect(popupPage.getByRole('main')).toContainText(
                ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre,
            );
            await popupPage.close();
        });
    });
});
