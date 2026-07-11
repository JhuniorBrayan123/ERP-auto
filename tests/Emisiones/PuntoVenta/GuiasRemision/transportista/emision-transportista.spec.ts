import {expect, test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {GUIAS_DATA} from "@helpers/PuntoVenta/guias-data.helper";

test.describe('GR-07 | Transportista — Emisión', {tag: ['@puntoventa', '@guias']}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('SC-01: Emitir guía transportista básica @GR-07.1', async ({cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}]
            })
        );

        await test.step('Verificar que la guía se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });
    });

    test('SC-02: Emitir guía transportista vinculando comprobante @GR-07.2', async ({
                                                                                cajero,
                                                                                listadoGuiasPage,
                                                                                page,
                                                                                busquedaComprobantes
                                                                            }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}
                ],
                vincularComprobante: {
                    tipo: 'BOLETA_DE_VENTA',
                    serie: 'B001',
                    correlativo: '150',
                    rucProveedor: '20759685854'
                }
            })
        );

        await test.step('Validar emisión exitosa y estado EMITIDO en comprobantes', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();

            const postEmision = new PostEmisionPage(page);
            const correlativoTexto = await postEmision.obtenerCorrelativoDinamico();
            const correlativo = String(parseInt(correlativoTexto.split('-')[1], 10));
            await listadoGuiasPage.cerrarModalExito()
            await busquedaComprobantes.navegarABusquedaComprobantes({
                correlativo,
                serie: correlativoTexto.split('-')[0],
                comprobanteId: 0
            });
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('SC-03: Emitir guía transportista con pagador de flete adicional @GR-07.3', async ({
                                                                                        cajero,
                                                                                        listadoGuiasPage,
                                                                                        page,
                                                                                        busquedaComprobantes
                                                                                    }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}],
                pagadorFlete: 'otros_terceros',
                pagadorFleteData: {documento: '76975258'}
            })
        );

        await test.step('Validar emisión exitosa y estado EMITIDO en comprobantes', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
            const postEmision = new PostEmisionPage(page);
            const correlativoTexto = await postEmision.obtenerCorrelativoDinamico();
            const correlativo = String(parseInt(correlativoTexto.split('-')[1], 10));
            await listadoGuiasPage.cerrarModalExito()
            await busquedaComprobantes.navegarABusquedaComprobantes({
                correlativo,
                serie: correlativoTexto.split('-')[0],
                comprobanteId: 0
            });
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('SC-04: Emitir guía transportista con retorno subcontratado @GR-07.4', async ({cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}],
                retorno: 'Transporte subcontratado',
                subcontratador: {documento: '20759685854'}
            })
        );

        await test.step('Verificar emisión exitosa y modal post-emisión completo', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
            await listadoGuiasPage.validarModalPostEmisionCompleto();
        });
    });

    test('SC-05: Emitir guía transportista con autorización especial @GR-07.5', async ({cajero, page, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}],
                autorizacionEspecial: {numeroAutorizacion: '1234567890'}
            })
        );

        await test.step('Verificar que la guía se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });

        await test.step('Validar botones de envío en modal post-emisión', async () => {
            await expect(page.getByText('Enviar por WhatsApp')).toBeVisible();
            await expect(page.getByText('Enviar por Email')).toBeVisible();
            await expect(page.getByText('Copiar Link')).toBeVisible();
            await expect(page.getByText('Descargar XML')).toBeVisible();
            await expect(page.getByText('Descargar PDF')).toBeVisible();
        });
    });
});
