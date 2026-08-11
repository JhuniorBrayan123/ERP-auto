import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {EmitirFacturaConDetraccion} from '@screenplay/tasks/facturacion/EmitirFacturaConDetraccion';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {VentaGridTargets} from '@screenplay/targets/facturacion/VentaGridTargets';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';
import {DetraccionPage} from '@pages/PuntoVenta/detraccion.page';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-11 | Emitir Factura con Detracción', {tag: ['@facturacion', '@detraccion']}, () => {

    test('SC-01: Emitir Factura con Detracción simple (10% - cuenta estándar) @FC-11.1', async ({cajero}) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaConDetraccion({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                detraccion: {
                    porcentaje: '10',
                    numeroCuenta: '11282847580',
                },
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });

    test('SC-02: Bloquear emisión con Detracción activada sin completar datos obligatorios @FC-11.2', async ({
                                                                                                                 page,
                                                                                                                 cajero
                                                                                                             }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );
        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);
        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.seleccionarOperacionTransporteCarga({
            porcentaje: '10',
            numeroCuenta: '11282847580',
        });
        await VentaGridTargets.btnPagar(page).click();
        const pagoVisible = await PagoTargets.btnRealizarPago(page).isVisible({timeout: 3_000}).catch(() => false);
        expect(pagoVisible).toBe(false);
    });
});
