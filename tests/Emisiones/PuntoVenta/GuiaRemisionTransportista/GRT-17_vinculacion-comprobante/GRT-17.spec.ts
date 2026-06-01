import {test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe('Guías de Remisión Transportista', {
tag: ['@guias', '@puntoventa', '@transportista']}, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P17: Emitir guía transportista vinculando comprobante @GRT-17', async ({cajero, listadoGuiasPage, page, busquedaComprobantes}) => {
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
