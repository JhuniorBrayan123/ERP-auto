import {test, expect} from '../../../../../src/fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteTask} from '../../../../../src/task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';
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

    test('P10: Emitir guía por traslado de mercancía extranjera sin contenedor @GR-10', async ({ cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_BIENES_TRANSFORMACION,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });
});
