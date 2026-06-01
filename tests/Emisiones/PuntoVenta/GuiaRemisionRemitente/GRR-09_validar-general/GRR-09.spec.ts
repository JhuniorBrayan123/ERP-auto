import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteConValidacionTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
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

    test('P9: Validar campos obligatorios generales @GR-09', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                skipUbigeo: true
            })
        );
        await expect(page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' })).toBeEmpty();
        await expect(page.getByRole('article').filter({ hasText: 'Datos del destinatario' }).locator('input[type="text"]')).toBeEmpty();
        await expect(page.getByText('Campo obligatorio').nth(1)).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Campo obligatorio$/ }).nth(2)).toBeVisible();
        await expect(page.getByRole('article').filter({ hasText: 'Datos de inicio de' }).locator('input[type="text"]')).toBeEmpty();
        await expect(page.getByRole('main')).toContainText('Debes ingresar un número mayor a 0');
        await expect(page.getByRole('textbox', { name: 'Kg' })).toHaveValue('0');
    });
});
