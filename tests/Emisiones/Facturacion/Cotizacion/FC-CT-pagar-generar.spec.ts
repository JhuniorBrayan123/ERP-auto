import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {BuscarCotizacionPorCorrelativo} from '@screenplay/interactions/cotizacion/BuscarCotizacionPorCorrelativo';
import {PagarCotizacion} from '@screenplay/interactions/cotizacion/PagarCotizacion';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {GenerarComprobanteDesdeBusqueda} from '@screenplay/interactions/facturacion/GenerarComprobanteDesdeBusqueda';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esFacturadoSi} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ValoresColumnaFacturado} from '@question/PuntoVenta/FacturadoColumna.question';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-CT-PAGAR | Pagar/Generar Comprobantes desde Cotización', {
    tag: ['@facturacion', '@cotizacion', '@pago', '@generar']
}, () => {
    let correlativoCotizacion = '';
    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    test('Setup: Crear Cotización base para los tests @FC-CT.Setup', async ({vendedor}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        correlativoCotizacion = cotizacion.correlativo;
        expect(correlativoCotizacion).toBeTruthy();
    });

    test.describe('Pagar Cotización desde Vista (CT.10-CT.12)', () => {
        for (const tipo of tiposComprobante) {
            test(`Generar ${tipo} pagando cotización cargada @FC-CT.Pagar${tipo.replace(/ /g, '')}`, async ({
                                                                                                                vendedor,
                                                                                                                page
                                                                                                            }) => {
                test.skip(!correlativoCotizacion, 'No se generó la cotización base');

                const postEmisionPage = new PostEmisionPage(page);
                if (await postEmisionPage.estaVisible()) {
                    await postEmisionPage.clickNuevaVenta();
                }

                await vendedor.realiza(
                    SeleccionarTipoComprobante('COTIZACION'),
                    BuscarCotizacionPorCorrelativo(correlativoCotizacion)
                );
                const emision = await vendedor.realizaYObtiene(PagarCotizacion(tipo));

                if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
                if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
                if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

                expect(Number(emision.correlativo)).toBeGreaterThan(0);

                // Validación integrada: tras transformar la Cotización → Boleta/Factura/NV,
                // la cotización origen DEBE mostrar Facturado = "SI" en Búsqueda de Comprobantes.
                // Si el producto muestra "No", el test FALLA y evidencia el bug CT01-174 (no silenciar).
                await vendedor.realiza(
                    IrABusquedaComprobantes(),
                    FiltrarComprobantePorTipo('COTIZACIONES')
                );

                const valoresFacturado = await vendedor.pregunta(
                    ValoresColumnaFacturado('COTIZACIONES', correlativoCotizacion)
                );
                expect(
                    valoresFacturado.some(esFacturadoSi),
                    `La cotización ${correlativoCotizacion} debería mostrar Facturado="SI" tras generar ${tipo}. ` +
                    `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
                ).toBe(true);
            });
        }
    });

    test.describe('Generar Comprobante desde Búsqueda (CT.15-CT.17)', () => {
        let cotizacionParaBusqueda = '';

        test('Setup: Crear cotización base para generar desde búsqueda @FC-CT.GenerarSetup', async ({vendedor}) => {
            const cotizacion = await vendedor.realizaYObtiene(
                CrearCotizacionVF({
                    cliente: CLIENTES.EMPRESA_RUC_AUTO,
                    items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                })
            );
            cotizacionParaBusqueda = cotizacion.correlativo;
            expect(cotizacionParaBusqueda).toBeTruthy();
        });

        for (const tipo of tiposComprobante) {
            test(`Generar ${tipo} buscando la cotización en la lista @FC-CT.Generar${tipo.replace(/ /g, '')}`, async ({
                                                                                                                          vendedor,
                                                                                                                          page
                                                                                                                      }) => {
                test.skip(!cotizacionParaBusqueda, 'No se generó la cotización base');

                await vendedor.realiza(
                    IrABusquedaComprobantes(),
                    FiltrarComprobantePorTipo('COTIZACIONES')
                );

                const emision = await vendedor.realizaYObtiene(
                    GenerarComprobanteDesdeBusqueda(cotizacionParaBusqueda, tipo)
                );

                if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B/);
                if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F/);
                if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV/);

                expect(Number(emision.correlativo)).toBeGreaterThan(0);

                // Validación integrada: tras transformar la Cotización → Boleta/Factura/NV
                // desde Búsqueda, la cotización origen DEBE mostrar Facturado = "SI".
                await vendedor.realiza(
                    IrABusquedaComprobantes(),
                    FiltrarComprobantePorTipo('COTIZACIONES')
                );

                const valoresFacturado = await vendedor.pregunta(
                    ValoresColumnaFacturado('COTIZACIONES', cotizacionParaBusqueda)
                );
                expect(
                    valoresFacturado.some(esFacturadoSi),
                    `La cotización ${cotizacionParaBusqueda} debería mostrar Facturado="SI" tras generar ${tipo} desde búsqueda. ` +
                    `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
                ).toBe(true);
            });
        }
    });
});
