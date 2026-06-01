import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
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

    test('P21: Validar campos obligatorios de guía transportista @GRT-21', async ({cajero, page}) => {
        await test.step('Intentar emitir sin llenar campos obligatorios', async () => {
            await page.getByRole('button', { name: 'Emitir' }).click();
        });

        await test.step('Validar mensajes de campo obligatorio', async () => {
            await expect(page.locator('div').filter({ hasText: /^Campo obligatorio$/ }).nth(5)).toBeVisible();
            await expect(page.getByRole('textbox', { name: 'Digite N° de documento' }).nth(1)).toBeEmpty();
            await expect(page.locator('.item-2 > div:nth-child(3) > .v-input-message > .v-input-message-small').first()).toBeVisible();
            await expect(page.getByRole('textbox', { name: 'Ej. A1A000' })).toBeEmpty();
            await expect(page.getByText('Campo obligatorio').first()).toBeVisible();
            await expect(page.getByRole('article').filter({ hasText: 'Datos del comprobanteFecha de' }).getByRole('textbox')).toBeEmpty();
            await expect(page.getByText('Debes ingresar un número')).toBeVisible();
        });
    });
});
