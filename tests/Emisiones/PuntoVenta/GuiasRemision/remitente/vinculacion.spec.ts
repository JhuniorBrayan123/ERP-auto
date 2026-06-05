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

test.describe('Guías de Remisión Remitente - Vinculación', { tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(IniciarVentaEnCaja('caja-auto'));
    });

    test('GRR-15: Emitir guía vinculando un comprobante', async ({page, listadoGuiasPage}) => {
        // 1. Emitir Factura como precondición usando flujo de emisión estándar
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
                        codigo: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo,
                        nombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre,
                        cantidad: 1,
                    }
                ],
            }
        );

        // 2. Navegar a Guía de Remisión Remitente
        await page.getByRole('button', { name: 'Nueva Venta' }).click();
        const navigateTask = NavegarAGuiaRemitente();
        await navigateTask(page);

        // 3. Vincular comprobante emitido a la guía
        const guiaPage = new GuiaRemitentePage(page);
        await guiaPage.vincularComprobanteEnModal(resultado.serie, resultado.correlativo);

        // 4. Completar datos de la guía
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

        // 5. Validar emisión exitosa
        await test.step('Validar emisión exitosa de guía vinculada', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });
    });
});
