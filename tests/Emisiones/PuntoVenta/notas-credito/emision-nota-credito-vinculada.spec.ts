import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {CrearNotaCreditoConVinculacion} from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import {ConsultarNotaCredito, VerDetalleNotaCredito} from '@screenplay/tasks/notas-credito/ConsultarNotaCredito';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {DetalleNotaCreditoCorrecto} from '@screenplay/questions/notas/DetalleNotaCorrecto';
import {CLIENTES, ITEMS_PV, TIPOS_DOCUMENTO_ORIGEN, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Notas de Crédito — Emisión con Vinculación', () => {

    test('Emitir NC por anulación CON retorno de stock desde factura', async ({facturador, postEmision}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.PRODUCTO_GRAVADO,
            })
        );
        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Anulación de la operación',
                textoMotivo: 'Anulación por automatización - con retorno de stock',
                retornoStock: true,
            })
        );

        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        expect(resultado.serie).toBeTruthy();
        expect(resultado.correlativo).toBeTruthy();
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });

    test('Emitir NC por devolución total CON retorno de stock desde boleta', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.BOLETA,
                cliente: CLIENTES.PERSONA_DNI,
                item: ITEMS_PV.PRODUCTO_GRAVADO,
            })
        );
        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.BOLETA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Devolución Total',
                textoMotivo: 'Devolución total por automatización',
                retornoStock: true,
            })
        );

        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    });

    test('Emitir NC por devolución total SIN retorno de stock desde factura', async ({facturador}) => {

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.PRODUCTO_GRAVADO,
            })
        );
        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Devolución Total',
                textoMotivo: 'Devolución total sin retorno de stock por automatización',
                retornoStock: false,
            })
        );
        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });

    test('Emitir NC por devolución por ítem CON retorno de stock desde factura', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.PRODUCTO_GRAVADO,
            })
        );

        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Devolución por ítem',
                textoMotivo: 'Devolución por ítem desde automatización con retorno',
                retornoStock: true,
                devolucionPorItem: true,
                cantidadDevolver: '1',
            })
        );

        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    });

    test('Consultar NC emitida y verificar detalle en vista comprobante', async ({
                                                                                     facturador,
                                                                                     busquedaComprobantes
                                                                                 }) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Anulación de la operación',
                textoMotivo: 'Anulación para consulta posterior',
                retornoStock: true,
            })
        );

        await facturador.page.getByRole('button', {name: /nueva venta/i}).click();

        await facturador.realiza(
            ConsultarNotaCredito(resultado.correlativo)
        );

        const popup = await facturador.realizaYObtiene(
            VerDetalleNotaCredito()
        );

        await facturador.pregunta(
            DetalleNotaCreditoCorrecto(popup, {
                tipoDocumento: 'Nota de crédito electrónica',
                tieneComprobanteVinculado: true,
                clienteEsperado: 'automatizacionerp2 cliente',
            })
        );

        await popup.getByRole('button', {name: /salir/i}).click();
    });
});
