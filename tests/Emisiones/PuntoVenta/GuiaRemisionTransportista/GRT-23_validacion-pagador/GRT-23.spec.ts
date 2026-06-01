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

    test('P23: Validar pagador de flete obligatorio @GRT-23', async ({cajero, page}) => {
        await test.step('Completar datos excepto pagador de flete', async () => {
            await page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-inicio:form-inicio_v-datepicker:fecha-emision"]').click();
            await page.getByRole('button', { name: /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i }).first().click();
            await page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-inicio:form-inicio_v-datepicker:fecha-inicio-traslado"]').click();
            await page.getByRole('button', { name: /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i }).first().click();
            await page.getByText('Retorno de vehículo con').first().click();
            await page.getByText('Retorno de vehículo con').nth(1).click();
            await page.locator('div').filter({ hasText: /^Remitente$/ }).nth(3).click();
            await page.getByText('Subcontratador', { exact: true }).click();
            await page.getByRole('article').filter({ hasText: 'Datos del comprobanteFecha de' }).getByPlaceholder('Digite N° de documento').fill('76975258');
            await page.getByText(/JHUNIOR BRAYAN GUTIERREZ/).first().click();
            await page.getByRole('textbox', { name: 'Digite N° de documento' }).first().fill('75652545');
            await page.getByText('Conductor automatizado').click();
            await page.getByRole('textbox', { name: 'Ej. A1A000' }).fill('ABC123');
            await page.getByRole('textbox', { name: 'Ej. A23456723' }).fill('A12345678');
            await page.locator('[id="pv_cmp-guia-remision-transportista_cmp-card-transporte:form-transporte_v-input:registro-mtc"]').fill('123');
            await page.getByRole('textbox', { name: 'Ej. 1234567891/' }).fill('1234567890/1234567890');
            await page.getByRole('textbox', { name: 'Digite N° de documento' }).fill('20759685854');
            await page.getByText('automatizacionerp2 cliente').click();
            await page.getByRole('textbox', { name: 'Busca por distrito, ciudad,' }).first().fill('AREQUIPA');
            await page.getByText('040101 - Arequipa').click();
            await page.getByRole('textbox', { name: 'Busca por distrito, ciudad,' }).fill('juliaca');
            await page.getByText('- Juliaca - San Roman - Puno').click();
            await page.getByRole('textbox', { name: 'Ej. Calle Manzanos 202, Urb.' }).fill('juliaca-automatización');
            await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
            await page.getByText('item gravado sin control').click();
            await page.getByText('Peso total (Kg)').first().click();
            await page.getByText('Peso total (Kg)').nth(1).click();
            await page.getByRole('textbox', { name: 'Kg' }).fill('10.51');
            await page.getByRole('button', { name: 'Emitir' }).click();
        });

        await test.step('Validar mensajes de campo obligatorio del pagador', async () => {
            await expect(page.getByRole('textbox', { name: 'Digite N° de RUC, nombre o' })).toBeEmpty();
            await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        });
    });
});
