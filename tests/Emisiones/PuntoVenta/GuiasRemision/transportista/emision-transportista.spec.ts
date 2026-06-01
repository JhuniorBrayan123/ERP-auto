import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe('Guías de Remisión Transportista - Emisión', { tag: ['@guias', '@puntoventa', '@transportista'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('GRT-16: Emitir guía transportista básica', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10', // Kg
                items: []
            })
        );

        await test.step('Verificar que la guía se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });
    });

    test('GRT-17: Emitir guía transportista vinculando comprobante', async ({ cajero, listadoGuiasPage, page, busquedaComprobantes }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
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
            const correlativo = correlativoTexto.split('-')[1];

            await busquedaComprobantes.navegarABusquedaComprobantes({correlativo, serie: correlativoTexto.split('-')[0], comprobanteId: 0});
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('GRT-18: Emitir guía transportista con pagador de flete adicional', async ({ cajero, listadoGuiasPage, page, busquedaComprobantes }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                pagadorFlete: 'otros_terceros',
                pagadorFleteData: { documento: '76975258' }
            })
        );

        await test.step('Validar emisión exitosa y estado EMITIDO en comprobantes', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();

            const postEmision = new PostEmisionPage(page);
            const correlativoTexto = await postEmision.obtenerCorrelativoDinamico();
            const correlativo = correlativoTexto.split('-')[1];

            await busquedaComprobantes.navegarABusquedaComprobantes({correlativo, serie: correlativoTexto.split('-')[0], comprobanteId: 0});
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('GRT-19: Emitir guía transportista con retorno subcontratado', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                retorno: 'transporte-subcontratado',
                subcontratador: { documento: '20759685854' }
            })
        );

        await listadoGuiasPage.validarGuiaEmitidaExito();
        await listadoGuiasPage.validarModalPostEmisionCompleto();
    });

    test('GRT-20: Emitir guía transportista con autorización especial', async ({ cajero, page, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                autorizacionEspecial: { numeroAutorizacion: '1234567890' }
            })
        );

        await listadoGuiasPage.validarGuiaEmitidaExito();

        await test.step('Validar botones de envío en modal post-emisión', async () => {
            await expect(page.getByText('Enviar por WhatsApp')).toBeVisible();
            await expect(page.getByText('Enviar por Email')).toBeVisible();
            await expect(page.getByText('Copiar Link')).toBeVisible();
            await expect(page.getByText('Descargar XML')).toBeVisible();
            await expect(page.getByText('Descargar PDF')).toBeVisible();
        });
    });
});
