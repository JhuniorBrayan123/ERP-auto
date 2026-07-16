import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {BuscarCotizacionPorCorrelativo} from '@screenplay/interactions/cotizacion/BuscarCotizacionPorCorrelativo';
import {PagarCotizacion} from '@screenplay/interactions/cotizacion/PagarCotizacion';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {GenerarComprobanteDesdeBusqueda} from '@screenplay/interactions/facturacion/GenerarComprobanteDesdeBusqueda';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-CT-PAGAR | Pagar/Generar Comprobantes desde Cotización', {
    tag: ['@facturacion', '@cotizacion', '@pago', '@generar']
}, () => {
    let correlativoCotizacion = '';
    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    test('Setup: Crear Cotización base para los tests @FC-CT.Setup', async ({vendedor}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO, // Requiere RUC para factura
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        correlativoCotizacion = cotizacion.correlativo;
        expect(correlativoCotizacion).toBeTruthy();
    });

    test.describe.skip('Pagar Cotización desde Vista (CT.10-CT.12) — sin producción', () => {
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

                if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B/);
                if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F/);
                if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV/);

                expect(Number(emision.correlativo)).toBeGreaterThan(0);
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
            });
        }
    });
});
