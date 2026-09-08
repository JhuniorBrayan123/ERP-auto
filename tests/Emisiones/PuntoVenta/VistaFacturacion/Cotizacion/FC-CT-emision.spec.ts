import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {CotizacionTargets} from '@screenplay/targets/cotizacion/CotizacionTargets';
import {BitacoraComprobante} from '@question/PuntoVenta/BitacoraComprobante.question';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

test.describe('FC-CT-EMISION | Emisión de Cotización desde Vista Facturación', {
    tag: ['@facturacion', '@cotizacion', '@emision']
}, () => {

    test('SC-01: Emitir cotización con cliente registrado @FC-CT.1', async ({vendedor}) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                observaciones: 'Cotización auto — cliente DNI',
            })
        );

        expect(resultado.numero).toMatch(/^CT\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await vendedor.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
    });

    test('SC-04: Emitir cotización con validez de oferta de 45 día @FC-CT.4', async ({vendedor}) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                validezOferta: '45 días',
                observaciones: 'Cotización con validez de oferta',
            })
        );

        expect(resultado.numero).toMatch(/^CT\d{2}-\d{8}$/);
    });

    test('SC-02: Emitir cotización con cliente sin documento @FC-CT.2', async ({vendedor}) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                clienteSinDoc: {nombre: 'cliente sin documento auto', direccion: 'direccion automatizada'},
                observaciones: 'Cotización auto — sin doc',
            })
        );

        expect(resultado.numero).toMatch(/^CT\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('SC-03: Emitir cotización con imágenes y descripción @FC-CT.3', async ({vendedor}) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                incluirImagenes: true,
                incluirDescripcion: true,
                observaciones: 'Cotización con imagen y descripción',
            })
        );

        expect(resultado.numero).toMatch(/^CT\d{2}-\d{8}$/);
    });

    test('SC-04: Emitir cotización con producto sin stock no genera descargo @FC-CT.6', async ({vendedor}) => {
        const resultadoCotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.PRODUCTO_SIN_STOCK],
            })
        );

        expect(resultadoCotizacion.numero).toMatch(/^CT\d{2}-\d{8}$/);

        const mockEmisionResult = {
            current: {
                serie: resultadoCotizacion.serie,
                correlativo: resultadoCotizacion.correlativo,
                comprobanteId: 0
            }
        };
        expect(await vendedor.pregunta(
            BitacoraComprobante.noMuestraDescargoInventario(mockEmisionResult, {skipClickNuevaVenta: true})
        )).toBe(true);
    });

    test('SC-05: Emitir cotización con IGV 10.5% @FC-CT.IGV', async ({vendedor, page}) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                igv: '10.5%',
                observaciones: 'Cotización con IGV 10.5%',
            })
        );

        expect(resultado.numero).toMatch(/^CT\d{2}-\d{8}$/);

        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.navegarABusquedaComprobantes();

        await busqueda.seleccionarCategoria('COTIZACIONES');

        await busqueda.filtrarPorCorrelativo(resultado.correlativo);
        const verPopup = await busqueda.abrirVerComprobante();
        await esperarCargaOverlaySiVisible(verPopup);
        await expect(verPopup.getByText('10.5%')).toBeVisible();
    });

    test('SC-06: Validar emisión de cotización sin productos impide emisión @FC-CT.5', async ({vendedor, page}) => {
        await vendedor.realiza(
            SeleccionarTipoComprobante('COTIZACION'),
        );

        await CotizacionTargets.btnEmitirVF(page).click();
        await expect(CotizacionTargets.mensajeSinItems(page)).toBeVisible({timeout: 5_000});
    });
});
