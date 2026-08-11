import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {ejecutarEmisionBasica} from '@flows/PuntoVenta/emision-basica.flow';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ComprobanteDetallePage} from '@pages/PuntoVenta/ComprobanteDetallePage';
import {capturarSaldoAnterior, verificarStockSinCambio} from '@helpers/PuntoVenta/verificaciones-pv.helper';

test.describe('GR-06 | Remitente — Vinculación', {tag: ['@puntoventa', '@guias']}, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(IniciarVentaEnCaja('caja-auto'));
    });

    test('SC-01: Emitir guía vinculando un comprobante @GR-06.1', async ({page, listadoGuiasPage, kardexApi}) => {
        
        const resultado = await ejecutarEmisionBasica(
            {
                comprobantePage: new ComprobantePage(page),
                clientePage: new ClientePage(page),
                emisionPage: new EmisionPage(page),
                comprobanteDetalle: new ComprobanteDetallePage(page),
            },
            {
                tipoComprobante: 'FACTURA',
                cliente: {
                    tipoDocumento: 'RUC',
                    documento: GUIAS_DATA.DESTINATARIO.RUC,
                    nombre: GUIAS_DATA.DESTINATARIO.NOMBRE_RUC,
                },
                items: [
                    {
                        codigo: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo,
                        nombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.nombre,
                        cantidad: 1,
                    }
                ],
            }
        );

        
        await page.getByRole('button', { name: 'Nueva Venta' }).click();
        const navigateTask = NavegarAGuiaRemitente();
        await navigateTask(page);

        
        const guiaPage = new GuiaRemitentePage(page);
        await guiaPage.vincularComprobanteEnModal(resultado.serie, resultado.correlativo);

        
        const saldoAntes = await capturarSaldoAnterior(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo
        );

        
        await guiaPage.completarPuntoPartidaYLlegada(
            GUIAS_DATA.REMITENTE.UBIGEO,
            GUIAS_DATA.DESTINATARIO.UBIGEO,
            GUIAS_DATA.REMITENTE.DIRECCION,
            GUIAS_DATA.DESTINATARIO.DIRECCION
        );
        await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
        await guiaPage.completarPlacaYLicencia(
            GUIAS_DATA.TRANSPORTISTA.PLACA,
            GUIAS_DATA.TRANSPORTISTA.LICENCIA
        );
        await guiaPage.definirPesoTotal('Kg', '10.45');
        await guiaPage.emitirGuia();

        
        await test.step('Validar emisión exitosa de guía vinculada', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });

        
        await verificarStockSinCambio(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo,
            saldoAntes
        );
    });
});
