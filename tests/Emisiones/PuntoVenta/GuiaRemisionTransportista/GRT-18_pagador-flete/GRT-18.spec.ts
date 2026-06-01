import {test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe('Guías de Remisión Transportista', {
 tag: ['@guias', '@puntoventa', '@transportista'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P18: Emitir guía transportista con pagador de flete adicional @GRT-18', async ({ cajero, listadoGuiasPage, page, busquedaComprobantes }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                pagadorFlete: 'otros_terceros',
                pagadorFleteData: { documento: '76975258' }
            })
        );

        await test.step('Validar emisión exitosa y estado EMITIDO en comprobantes', async () => {
            // 1. Validar que se emitió correctamente
            await listadoGuiasPage.validarGuiaEmitidaExito();

            // 2. Capturar correlativo desde la pantalla post-emisión
            const postEmision = new PostEmisionPage(page);
            const correlativoTexto = await postEmision.obtenerCorrelativoDinamico();
            const correlativo = correlativoTexto.split('-')[1];

            console.log(`   Guía emitida: ${correlativoTexto} | Correlativo: ${correlativo}`);

            // 3. Navegar a búsqueda de comprobantes y filtrar
            await busquedaComprobantes.navegarABusquedaComprobantes({correlativo, serie: correlativoTexto.split('-')[0], comprobanteId: 0});

            // 4. Validar que aparece EMITIDO
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });
    });
});
