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

    test('P11: Emitir guía por traslado de mercancía extranjera con contenedor @GR-11', async ({ cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_MERCANCIA_EXTRANJERA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                dam: '2024/124-4567-10-12345',
                bultos: '10',
                contenedorNumero: '1',
                contenedorPrecinto: '1',
                peso: '1',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo }
                ]
            })
        );
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });
});
