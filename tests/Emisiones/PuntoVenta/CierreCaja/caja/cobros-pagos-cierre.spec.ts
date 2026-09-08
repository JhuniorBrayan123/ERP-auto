import {expect} from '@playwright/test';
import {test} from '@fixtures/PuntoVenta/caja.fixture';
import {IrACierreDeCaja} from '@screenplay/tasks/caja/IrACierreDeCaja';
import {IrACobros, RegistrarCobroCliente} from '@screenplay/tasks/caja/IrACobros';
import {RegresarANuevaVenta} from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    BuscarCobroEnCierre,
    ConsultarCobrosYPagos,
    ExpandirTarjetaCobroResultado,
    ValidarDatosTarjetaCobroResultado,
} from '@screenplay/tasks/cierre-caja/ConsultarCobrosYPagos';
import {UsarNavegador} from '@abilities/usarnavegador';
import {CobrosPagosTargets} from "@screenplay/targets/cierre-caja/CobrosPagosTargets";
import {CLIENTES} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('CC-02 | Cobros y Pagos', {tag: ['@cierre-caja']}, () => {
    test.describe.configure({mode: 'serial'});

    test('SC-01: Registrar cobro de venta a crédito y verificar reflejo en cierre de caja @CC-02.1', async ({
                                                                                                                cajero,
                                                                                                                ventaCreditoBoleta,
                                                                                                            }) => {

        await cajero.realiza(IrACobros());

        const {idDocFinanciero} = await cajero.realizaYObtiene(
            RegistrarCobroCliente({
                monto: '10.56',
                correlativoComprobante: ventaCreditoBoleta.correlativo,
            }),
        );
        const page = cajero.habilidad(UsarNavegador).page;
        await CobrosPagosTargets.opcionCobroPendiente(page).click();
        await CobrosPagosTargets.selectorEstadoCobro(page).click();
        await CobrosPagosTargets.opcionTodosEstadoCobro(page).click();
        await CobrosPagosTargets.iconoOpcionesFilaCobro(page).click();
        await CobrosPagosTargets.opcionVerCobro(page).click();
        await expect(CobrosPagosTargets.textoMontoAdeudado(page)).toBeVisible({timeout: 10_000});
        await expect(CobrosPagosTargets.textoMontoCobrado(page)).toBeVisible();

        await CobrosPagosTargets.btnCerrarDrape(page).click();


        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarCobrosYPagos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarCobroEnCierre(idDocFinanciero),
        );

        await cajero.realiza(ExpandirTarjetaCobroResultado());
        await cajero.realiza(ValidarDatosTarjetaCobroResultado({
            numeroComprobante: ventaCreditoBoleta.numero,
            monto: '10.56',
            nombreCliente: CLIENTES.EMPRESA_RUC_AUTO.nombre,
            documentoCliente: CLIENTES.EMPRESA_RUC_AUTO.documento,
        }));

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('SC-02: Validar que el cobro aparece en la sección Cobros con datos correctos @CC-02.2', async ({
                                                                                                             cajero,
                                                                                                             ventaCreditoFactura,
                                                                                                         }) => {

        await cajero.realiza(IrACobros());

        const {idDocFinanciero} = await cajero.realizaYObtiene(
            RegistrarCobroCliente({
                monto: '10.56',
                correlativoComprobante: ventaCreditoFactura.correlativo,
            }),
        );

        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarCobrosYPagos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarCobroEnCierre(idDocFinanciero),
        );


        if (movimiento.ReceptorRazonSocial) {
            const page = cajero.habilidad(UsarNavegador).page;
            await expect(
                CobrosPagosTargets.clienteVisibleEnResultado(page, movimiento.ReceptorRazonSocial),
            ).toBeVisible();
        }

        await cajero.realiza(ExpandirTarjetaCobroResultado());
        await cajero.realiza(ValidarDatosTarjetaCobroResultado({
            numeroComprobante: ventaCreditoFactura.numero,
            monto: '10.56',
            nombreCliente: CLIENTES.EMPRESA_RUC_AUTO.nombre,
            documentoCliente: CLIENTES.EMPRESA_RUC_AUTO.documento,
        }));

        await cajero.realiza(RegresarANuevaVenta());
    });
});
