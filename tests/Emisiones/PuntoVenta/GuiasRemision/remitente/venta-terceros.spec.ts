import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';
import {EmitirGuiaRemitenteConValidacionTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('GR-05 | Remitente — Venta a terceros', {tag: ['@puntoventa', '@guias']}, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('SC-01: Emitir guía por venta con entrega a terceros @GR-05.1', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA_TERCEROS,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}
                ]
            })
        );

        await test.step('Verificar emisión de guía por entrega a terceros', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });
    });

    test('SC-02: Validar comprador obligatorio en venta con entrega a terceros @GR-05.2', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA_TERCEROS,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                skipDestinatario: true,
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo}
                ]
            })
        );
        await expect(page.getByText('Buscar comprador')).toBeVisible();
        await expect(page.getByText('Campo obligatorio').first()).toBeVisible();
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
    });
});
