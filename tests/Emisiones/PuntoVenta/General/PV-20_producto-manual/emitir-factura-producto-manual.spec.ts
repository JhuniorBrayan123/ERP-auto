import {test} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {EmitirComprobanteConProductoManual} from '@screenplay/tasks/facturacion/EmitirComprobanteConProductoManual';
import {CLIENTES, PRODUCTO_MANUAL} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('PV-20 | Producto Manual — Emisión', {tag: ['@puntoventa', '@pv-20']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-02: Emitir Factura con producto manual y empresa RUC @PV-20.2', async ({page}) => {
        const cajero = Cajero.con(page);

        const resultado = await test.step('Given: emitir factura con producto manual y empresa RUC', async () => {
            return await cajero.realizaYObtiene(
                EmitirComprobanteConProductoManual({
                    tipoComprobante: 'FACTURA',
                    cliente: CLIENTES.EMPRESA_RUC_AUTO,
                    producto: PRODUCTO_MANUAL,
                    metodoPago: 'efectivo',
                })
            );
        });

        const busqueda = new BusquedaComprobantesPage(page);

        await test.step('Then: ir a Búsqueda de comprobantes y consultar SUNAT', async () => {
            await busqueda.navegarABusquedaComprobantesConSunat(resultado);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busqueda.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión y descargo de inventarios', async () => {
            await busqueda.abrirBitacoraDelPrimerComprobante();
            await busqueda.validarComprobanteEmitido(estadoSunat);
            await busqueda.cerrarBitacora();
        });
    });
});
