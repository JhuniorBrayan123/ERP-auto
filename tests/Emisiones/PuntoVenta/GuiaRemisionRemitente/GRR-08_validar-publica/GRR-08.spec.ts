import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteConValidacionTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Remitente', {
    tag: ['@guias', '@puntoventa']
}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('P8: Validar obligatorios por modalidad pública @GR-08', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                skipTransportista: true,
                peso: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo}
                ]
            })
        );
        await expect(page.getByRole('textbox', { name: 'Digite N° de documento' })).toBeEmpty();
        await expect(page.getByText('Campo obligatorio')).toBeVisible();
        await expect(page.getByText('Buscar transportista')).toBeVisible();
    });
});
