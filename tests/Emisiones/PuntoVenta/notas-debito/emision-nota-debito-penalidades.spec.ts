import {test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {CrearNotaDebitoConVinculacion} from '@screenplay/tasks/notas-debito/CrearNotaDebitoConVinculacion';
import {ConsultarNotaDebito, VerDetalleNotaDebito} from '@screenplay/tasks/notas-debito/ConsultarNotaDebito';
import {DetalleNotaDebitoCorrecto} from '@screenplay/questions/notas/DetalleNotaCorrecto';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Notas de Débito — Penalidades / Otros Conceptos', () => {

    test('Emitir ND por penalidades desde factura y verificar en detalle', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        const resultado = await facturador.realizaYObtiene(
            CrearNotaDebitoConVinculacion({
                tipoDocumento: 'Factura',
                serie: origen.serie,
                correlativo: origen.correlativo,
                motivo: 'Penalidades/ otros conceptos',
                textoMotivo: 'Penalidades por automatización',
                monto: '10',
            })
        );

        await facturador.page.getByRole('button', {name: /nueva venta/i}).click();

        await facturador.realiza(ConsultarNotaDebito(resultado.correlativo));

        const popup = await facturador.realizaYObtiene(VerDetalleNotaDebito());

        await facturador.pregunta(
            DetalleNotaDebitoCorrecto(popup, {
                tipoDocumento: 'Nota de débito electrónica',
                tieneComprobanteVinculado: true,
                tipoNota: 'Penalidades/ otros conceptos',
                motivoEsperado: 'Penalidades por automatización',
                rucEsperado: '20759685854',
                nombreEsperado: 'automatizacionerp2 cliente RUC',
            })
        );

        await popup.getByRole('button', {name: /salir/i}).click();
    });
});
