import {expect} from '@playwright/test';
import {test} from '@fixtures/PuntoVenta/caja.fixture';
import {IrACierreDeCaja} from '@screenplay/tasks/caja/IrACierreDeCaja';
import {RegresarANuevaVenta} from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    BorrarFiltrosVentas,
    BuscarComprobanteEnVentas,
    ConsultarVentasDeCaja,
} from '@screenplay/tasks/cierre-caja/ConsultarVentasDeCaja';
import {ComprobanteVisibleEnVentas} from '@screenplay/questions/cierre-caja/ComprobanteVisibleEnVentas';
import {CierreCajaTargets} from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import {UsarNavegador} from '@abilities/usarnavegador';

test.describe('CC-08 | Ventas', {tag: ['@cierre-caja']}, () => {
    test.describe.configure({mode: 'serial'});

    test('SC-01: Validar boleta emitida en ventas de cierre de caja @CC-08.1', async ({
                                                                          cajero,
                                                                          boletaEmitida,
                                                                      }) => {
        
        const comprobante = boletaEmitida;

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Boleta',
                correlativo: comprobante.correlativo,
            }),
        );

        
        const visible = await cajero.pregunta(
            ComprobanteVisibleEnVentas({
                tipoDocumento: 'BOLETA DE VENTA',
                serie: comprobante.serie,
                correlativo: comprobante.correlativo,
            }),
        );
        expect(visible).toBe(true);

        
        const page = cajero.habilidad(UsarNavegador).page;
        await expect(
            CierreCajaTargets.contenedorPrincipal(page).getByText(/Total monto:/i),
        ).toBeVisible();

        await cajero.realiza(BorrarFiltrosVentas(), RegresarANuevaVenta());
    });

    test('SC-02: Validar factura emitida en ventas de cierre de caja @CC-08.2', async ({
                                                                           cajero,
                                                                           facturaEmitida,
                                                                       }) => {
        
        const comprobante = facturaEmitida;

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Factura',
                correlativo: comprobante.correlativo,
            }),
        );

        
        const visible = await cajero.pregunta(
            ComprobanteVisibleEnVentas({
                tipoDocumento: 'FACTURA',
                serie: comprobante.serie,
                correlativo: comprobante.correlativo,
                estado: 'EMITIDO',
            }),
        );
        expect(visible).toBe(true);

        await cajero.realiza(BorrarFiltrosVentas(), RegresarANuevaVenta());
    });

    test('SC-03: Usar filtros avanzados mixtos: tipo + correlativo + estado @CC-08.3', async ({
                                                                                  cajero,
                                                                                  boletaEmitida,
                                                                              }) => {
        
        const comprobante = boletaEmitida;

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Boleta',
                correlativo: comprobante.correlativo,
                estado: 'EMITIDO',
            }),
        );

        
        const page = cajero.habilidad(UsarNavegador).page;
        await expect(
            CierreCajaTargets.contenedorPrincipal(page).getByText(/EMITIDO/i).first(),
        ).toBeVisible();

        await cajero.realiza(BorrarFiltrosVentas(), RegresarANuevaVenta());
    });
});
