import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {EditarCotizacionVF} from '@screenplay/tasks/cotizacion/EditarCotizacionVF';
import {BuscarCotizacionPorCorrelativo} from '@screenplay/interactions/cotizacion/BuscarCotizacionPorCorrelativo';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {CotizacionTargets} from '@screenplay/targets/cotizacion/CotizacionTargets';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';

test.describe.skip('FC-CT-BUSQUEDA | Búsqueda y Edición de Cotización en Vista Facturación — sin producción', {
    tag: ['@facturacion', '@cotizacion', '@busqueda']
}, () => {

    test('SC-01: Buscar cotización existente carga los datos @FC-CT.6', async ({vendedor, page}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                validezOferta: '35 días',
            })
        );
        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
            BuscarCotizacionPorCorrelativo(cotizacion.correlativo)
        );

        await expect(page.locator('main')).toContainText(CLIENTES.PERSONA_DNI.nombre);
        await expect(CotizacionTargets.opcionVigencia(page, '35 días')).toBeVisible();
        await expect(page.locator('tbody')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    });

    test('SC-02: Buscar cotización inexistente muestra mensaje de validación @FC-CT.7', async ({vendedor, page}) => {
        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
            BuscarCotizacionPorCorrelativo('99999999')
        );

        await expect(CotizacionTargets.mensajeNoEncontrado(page)).toBeVisible();
    });

    test('SC-05: Validar búsqueda de cotización sin correlativo numérico válido @FC-CT.9b', async ({
                                                                                                       vendedor,
                                                                                                       page
                                                                                                   }) => {
        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
        );
        const inputCorrelativo = CotizacionTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill('asfasxasxawdq');

        await expect(inputCorrelativo).toHaveValue('');
    });

    test('SC-03: Cargar cotización no mezcla productos actuales @FC-CT.8', async ({vendedor, page}) => {
        const cotizacionA = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.PRODUCTO_SIMPLE],
            })
        );

        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI_2),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            BuscarCotizacionPorCorrelativo(cotizacionA.correlativo)
        );
        await expect(page.locator('tbody')).toContainText(ITEMS_PV.PRODUCTO_SIMPLE.nombre);
        await expect(page.locator('tbody')).not.toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    });

    test('SC-04: Actualizar cotización cargada mantiene correlativo @FC-CT.9', async ({vendedor, page}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );

        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
            EditarCotizacionVF({
                correlativo: cotizacion.correlativo,
                nuevosItems: [ITEMS_PV.PRODUCTO_SIMPLE],
                nuevoIGV: '10.5%'
            })
        );

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible();
    });
});
