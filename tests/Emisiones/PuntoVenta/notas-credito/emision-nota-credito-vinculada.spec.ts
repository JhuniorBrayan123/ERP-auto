import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {ObtenerComprobanteRecurrente} from '@screenplay/tasks/common/ObtenerComprobanteRecurrente';
import {CrearNotaCreditoConVinculacion} from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import {ConsultarNotaCredito, VerDetalleNotaCredito} from '@screenplay/tasks/notas-credito/ConsultarNotaCredito';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {DetalleNotaCreditoCorrecto} from '@screenplay/questions/notas/DetalleNotaCorrecto';
import {CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE, TIPOS_DOCUMENTO_ORIGEN} from '@helpers/PuntoVenta/emision-data.helper';
import {capturarStockNC, validarStockDespuesNC} from '@helpers/PuntoVenta/verificar-stock-nc.helper';
import {esperarStockDespuesVenta} from "@helpers/PuntoVenta/esperarStockDespuesVenta";
import {asegurarClienteExtranjeria} from "@helpers/PuntoVenta/asegurar-cliente.helper";
import {ClickNuevaVenta} from '@interactions/PuntoVenta/ClickNuevaVenta';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';

test.describe('NC-05 | Emisión con Vinculación', {tag: ['@puntoventa', '@nota-credito']}, () => {

    test('SC-01: Emitir NC por anulación CON retorno de stock desde factura @NC-05.1', async ({
                                                                                                  facturador,
                                                                                                  postEmision,
                                                                                                  kardexApi
                                                                                              }) => {
        const stockOriginal = await capturarStockNC(kardexApi, ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ESTRICTO_GRAVADO_2,
            })
        );

        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            cantidadVendida: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad
        });

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

        await validarStockDespuesNC({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            stockDespuesVenta,
            cantidadDevuelta: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad,
            retornoStock: true,
        });
    });

    test('SC-02: Emitir NC por devolución total CON retorno de stock desde boleta @NC-05.2', async ({
                                                                                                        facturador,
                                                                                                        kardexApi
                                                                                                    }) => {
        const stockOriginal = await capturarStockNC(kardexApi, ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.BOLETA,
                cliente: CLIENTES.PERSONA_DNI,
                item: ITEMS_PV.ESTRICTO_GRAVADO_2,
            })
        );

        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            cantidadVendida: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad
        });

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

        await validarStockDespuesNC({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            stockDespuesVenta,
            cantidadDevuelta: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad,
            retornoStock: true,
        });
    });

    test('SC-03: Emitir NC por devolución total SIN retorno de stock desde factura @NC-05.3', async ({
                                                                                                         facturador,
                                                                                                         kardexApi
                                                                                                     }) => {
        const stockOriginal = await capturarStockNC(kardexApi, ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ESTRICTO_GRAVADO_2,
            })
        );

        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            cantidadVendida: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad
        });

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

        await validarStockDespuesNC({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            stockDespuesVenta,
            cantidadDevuelta: 0,
            retornoStock: false,
        });
    });

    test('SC-04: Emitir NC por devolución por ítem CON retorno de stock desde factura @NC-05.4', async ({
                                                                                                            facturador,
                                                                                                            kardexApi
                                                                                                        }) => {
        const stockOriginal = await capturarStockNC(kardexApi, ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ESTRICTO_GRAVADO_2,
            })
        );

        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            cantidadVendida: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad
        });

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

        await validarStockDespuesNC({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            stockDespuesVenta,
            cantidadDevuelta: 1,
            retornoStock: true,
        });
    });

    test('SC-05: Consultar NC emitida y verificar detalle en vista comprobante @NC-05.5', async ({
                                                                                                     facturador,
                                                                                                     busquedaComprobantes,
                                                                                                     registrarNota
                                                                                                 }) => {
        const origen = await facturador.realizaYObtiene(
            ObtenerComprobanteRecurrente('FACTURA')
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
        registrarNota(resultado.numero);
        await facturador.realiza(ClickNuevaVenta());
        await facturador.realiza(IrABusquedaComprobantes());
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

    test('SC-06: Emitir NC vinculada por ajustes de operaciones de exportación @NC-05.6', async ({
                                                                                                     facturador,
                                                                                                     busquedaComprobantes
                                                                                                 }) => {
        const clienteCE = await asegurarClienteExtranjeria(facturador.page, {
            documento: 'E12345678',
            nombre: 'Cliente Extranjería',
            direccion: 'Dirección automatizado qa',
            telefono: '999999999',
            email: 'srqapruebaserp2@gmail.com',
            textoSelector: 'Cliente Extranjería',
        });
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.BOLETA,
                exportacion: true,
                cliente: clienteCE as any,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,

            })
        );
        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.BOLETA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Ajustes de operaciones de exportación',
                textoMotivo: 'Ajuste de operaciones de exportación por automatización',
                monto: '10.00',
            })
        );
        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);

        await facturador.realiza(ClickNuevaVenta());
        await facturador.realiza(IrABusquedaComprobantes());
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
                clienteEsperado: 'Cliente Extranjería'
            })
        );

    });
});
