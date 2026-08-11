import { test, expect } from '@fixtures/PuntoVenta/guias-fixture';
import { EmitirGuiaRemitenteConValidacionTask } from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import { GUIAS_DATA } from '@helpers/PuntoVenta/guias-data.helper';
import { NavegarAGuiaRemitente } from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('GR-04 | Remitente — Validaciones Generales', { tag: ['@puntoventa', '@guias'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('SC-01: Validar campos obligatorios generales @GR-04.1', async ({ cajero, page }) => {
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

    test('SC-02: Validar obligatorios por modalidad privada @GR-04.2', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PRIVADA,
                skipConductor: true,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('textbox', { name: 'Digite N° de documento' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Ej. A1A000' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Ej. A23456723' })).toBeEmpty();
    });

    test('SC-03: Validar obligatorios por modalidad pública @GR-04.3', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                skipTransportista: true,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await expect(page.getByRole('textbox', { name: 'Digite N° de documento' })).toBeEmpty();
        await expect(page.getByText('Campo obligatorio')).toBeVisible();
        await expect(page.getByText('Buscar transportista')).toBeVisible();
    });

    test.skip('SC-04: Validar que fecha de inicio de traslado no sea menor a fecha de emisión @GR-04.4', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PRIVADA,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ],
                fechaInicioTrasladoDiasAtras: 1,
            })
        );
        await expect(page.getByRole('main')).toContainText('fecha de inicio de traslado no puede ser menor');
    });
});
