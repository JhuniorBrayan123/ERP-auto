import {test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlaySiVisible, recargarSiHayError} from "@utils/wait-helpers";

test.describe('PV-03 | Nota de venta con equivalencias y lista', {tag: ['@punto-venta', '@nota-venta', '@equivalencias']}, () => {

    test('SC-01: Emitir nota de venta con lista de productos @PV-03.1', async ({
                                                                                   cajaPage,
                                                                                   comprobantePage,
                                                                                   emisionPage,
                                                                                   busquedaComprobantes,
                                                                                   page,
                                                                               }) => {
        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('When: agregar lista de ítems flexibles', async () => {
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.PERSONA_DNI_2.documento);
            await page.getByText(CLIENTES.PERSONA_DNI_2.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.LISTA_ITEMS_ESTRICTOS.codigo);
            await page.getByText(ITEMS_PV.LISTA_ITEMS_ESTRICTOS.nombre).first().click();
            await page.locator('[id="_div:increase"]').first().click();
            await page.getByRole('button', {name: 'Agregar a venta'}).click();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });
        await test.step('recargar si hay error', async () => {
            await recargarSiHayError(page)
        })
        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await esperarCargaOverlaySiVisible(page)
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('SC-02: Emitir nota de venta con equivalencia @PV-03.2', async ({
                                                                             cajaPage,
                                                                             comprobantePage,
                                                                             emisionPage,
                                                                             busquedaComprobantes,
                                                                             page,
                                                                         }) => {
        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('When: agregar ítem con equivalencia X6', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_EQUIVALENTE.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_EQUIVALENTE.nombre);
            await page.getByText('Equivalente X2').click();
            await page.getByText('Equivalencia X6').click();
            await page.locator('.cmp-informacion-item > div').first().click();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });
        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });
        await test.step('recargar si hay error', async () => {
            await recargarSiHayError(page)
        })
        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await esperarCargaOverlaySiVisible(page)
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });
        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });
});
