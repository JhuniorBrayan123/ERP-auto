import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {ConvertirComprobanteDesdeDetalle} from '@screenplay/interactions/facturacion/ConvertirComprobanteDesdeDetalle';
import {ClonarComprobanteDesdeDetalle} from '@task/PuntoVenta/busqueda-comprobantes/ClonarComprobanteDesdeDetalle';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esFacturadoSi} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ValoresColumnaFacturado} from '@question/PuntoVenta/FacturadoColumna.question';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-CT-CONVERTIR | Convertir/Clonar Cotización desde Ver Comprobante', {
    tag: ['@facturacion', '@cotizacion']
}, () => {
    let correlativoCotizacion = '';
    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    test('Setup: Crear Cotización base para convertir desde detalle @FC-CT.ConvertirSetup', async ({vendedor}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        correlativoCotizacion = cotizacion.correlativo;
        expect(correlativoCotizacion).toBeTruthy();
    });

    for (const tipo of tiposComprobante) {
        test(`Convertir ${tipo} desde detalle @FC-CT.Convertir${tipo.replace(/ /g, '')}`, async ({vendedor, page}) => {
            test.skip(!correlativoCotizacion, 'No se generó la cotización base');

            const postEmisionPage = new PostEmisionPage(page);
            if (await postEmisionPage.estaVisible()) {
                await postEmisionPage.clickNuevaVenta();
            }

            // Camino C: Ver Comprobante → "Convertir a" → tipo destino → pago → EmisionResult
            const emision = await vendedor.realizaYObtiene(
                ConvertirComprobanteDesdeDetalle(correlativoCotizacion, 'COTIZACION', tipo)
            );

            if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
            if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
            if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

            expect(Number(emision.correlativo)).toBeGreaterThan(0);

            // Validación integrada: tras convertir la Cotización desde detalle, la
            // cotización origen DEBE mostrar Facturado = "SI"/"Sí" en Búsqueda de
            // Comprobantes. Si el producto muestra "No", el test FALLA y evidencia el
            // bug CT01-174 (no se silencia ni se hace skip).
            await vendedor.realiza(
                IrABusquedaComprobantes(),
                FiltrarComprobantePorTipo('COTIZACIONES')
            );

            const valoresFacturado = await vendedor.pregunta(
                ValoresColumnaFacturado('COTIZACIONES', correlativoCotizacion)
            );
            expect(
                valoresFacturado.some(esFacturadoSi),
                `La cotización ${correlativoCotizacion} debería mostrar Facturado="SI" tras convertir a ${tipo} desde detalle. ` +
                `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
            ).toBe(true);
        });
    }

    test('Clonar cotización desde detalle hacia caja VENTA @FC-CT.ClonarDetalle', async ({vendedor, page}) => {
        test.skip(!correlativoCotizacion, 'No se generó la cotización base');

        const postEmisionPage = new PostEmisionPage(page);
        if (await postEmisionPage.estaVisible()) {
            await postEmisionPage.clickNuevaVenta();
        }

        // Clonar desde Ver Comprobante → caja VENTA → se abre venta con datos del origen
        const popupVenta = await vendedor.realizaYObtiene(
            ClonarComprobanteDesdeDetalle.haciaCaja(correlativoCotizacion, 'COTIZACION', CAJAS.VENTA.nombre)
        );

        // Datos transferidos (patrón BC-21.1): cliente + item visibles en el popup de emisión
        await expect(popupVenta.getByRole('main')).toContainText(
            CLIENTES.EMPRESA_RUC_AUTO.nombre, {timeout: 30_000},
        );
        await expect(popupVenta.getByRole('main')).toContainText(
            ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre,
        );
        await popupVenta.close();
    });

    // Caso bug CT01-174 (B001-631): convertir la cotización DESDE EL DETALLE
    // (Camino C) deja la columna Facturado en "No" en Búsqueda de Comprobantes.
    // Este test crea su PROPIA cotización y espera Facturado="SI"; si el producto
    // muestra "No", el test FALLA y evidencia el bug. NO se hace skip ni se
    // silencia: es la evidencia automatizada del defecto.
    test('Bug CT01-174: Facturado="SI" tras convertir desde detalle @FC-CT.ConvertirFacturadoBug', async ({vendedor, page}) => {
        const cotizacion = await vendedor.realizaYObtiene(
            CrearCotizacionVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        const correlativoBug = cotizacion.correlativo;
        expect(correlativoBug).toBeTruthy();

        const postEmisionPage = new PostEmisionPage(page);
        if (await postEmisionPage.estaVisible()) {
            await postEmisionPage.clickNuevaVenta();
        }

        const emision = await vendedor.realizaYObtiene(
            ConvertirComprobanteDesdeDetalle(correlativoBug, 'COTIZACION', 'BOLETA')
        );
        expect(emision.serie).toMatch(/^B001/);
        expect(Number(emision.correlativo)).toBeGreaterThan(0);

        await vendedor.realiza(
            IrABusquedaComprobantes(),
            FiltrarComprobantePorTipo('COTIZACIONES')
        );

        const valoresFacturado = await vendedor.pregunta(
            ValoresColumnaFacturado('COTIZACIONES', correlativoBug)
        );
        expect(
            valoresFacturado.some(esFacturadoSi),
            `Bug CT01-174: la cotización ${correlativoBug} debería mostrar Facturado="SI" tras convertir a BOLETA ` +
            `desde detalle (Camino C). Valores encontrados: ${JSON.stringify(valoresFacturado)}. ` +
            `Si el producto muestra "No", este test evidencia el bug y no debe silenciarse.`
        ).toBe(true);
    });
});
