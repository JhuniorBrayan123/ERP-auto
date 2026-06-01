import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Transportista', {
    tag: ['@guias', '@puntoventa', '@transportista']
}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P20: Emitir guía transportista con autorización especial @GRT-20', async ({cajero, page, listadoGuiasPage}) => {
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
