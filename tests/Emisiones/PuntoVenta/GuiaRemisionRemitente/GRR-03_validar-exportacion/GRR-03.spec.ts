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

    test('P3: Validar datos obligatorios de exportación @GR-03', async ({ cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.EXPORTACION,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByText('Campo obligatorio').nth(2)).toBeVisible();
    });
});
