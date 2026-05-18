/**
 * PV-04 | Emisión de nota de venta con descuento por ítem
 *
 * IMPORTANTE: Notas de venta NO llegan a SUNAT → no se valida estado SUNAT.
 * Post-emisión: cada test exitoso navega a Búsqueda de comprobantes + Bitácora.
 */
import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-04 | Emisión de nota de venta con descuento por ítem @PV-04', {tag: ['@punto-venta', '@nota-venta', '@descuento']}, () => {

    test('Emitir nota de venta con descuento global por monto @PV-04.2', async ({
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

        await test.step('And: agregar producto', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: aplicar descuento global de S/25', async () => {
            await emisionPage.abrirDescuentoGlobal();
            await emisionPage.llenarDescuentoGlobal('25');
            await emisionPage.aplicarDescuentoGlobal();
        });

        await test.step('And: verificar descuento en totales', async () => {
            await emisionPage.abrirTotales();
            await expect(page.getByText('Total descuento global')).toBeVisible();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });
    });
});
