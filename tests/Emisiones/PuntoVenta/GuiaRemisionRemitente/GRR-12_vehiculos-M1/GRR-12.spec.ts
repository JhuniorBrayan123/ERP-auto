import {test, expect} from '../../../../../src/fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteConValidacionTask} from '../../../../../src/task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import {GUIAS_DATA} from '../../../../../src/helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Remitente', {
 tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('P12: Emitir guía con traslado de vehículos categoría M1 o L @GR-12', async ({ cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                trasladoVehiculosM1: true,
                skipConductor: true,
                skipTransportista: true,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });
});
