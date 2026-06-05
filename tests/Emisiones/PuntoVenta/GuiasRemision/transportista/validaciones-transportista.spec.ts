import {expect, test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Transportista - Validaciones', {tag: ['@guias', '@puntoventa', '@transportista']}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('GRT-21: Validar campos obligatorios de guía transportista', async ({page}) => {
        await test.step('Intentar emitir sin llenar campos obligatorios', async () => {
            await page.getByRole('button', {name: 'Emitir'}).click();
        });

        await test.step('Validar mensajes de campo obligatorio', async () => {
            await expect(page.getByText('Campo obligatorio').first()).toBeVisible({timeout: 5_000});
            await expect(page.getByText('Debes ingresar un número')).toBeVisible();
            await expect(page.getByRole('textbox', {name: 'Digite N° de documento'}).first()).toBeEmpty();
            await expect(page.getByRole('textbox', {name: 'Ej. A1A000'})).toBeEmpty();
        });
    });

    test('GRT-22: Validar fecha de traslado inválida', async () => {
        // PLACEHOLDER: ERP no valida fecha de traslado anterior a la fecha de emisión actualmente.
        // El codegen ejecuta el flujo completo pero sin assertions porque el sistema permite emitir.
        // Pendiente de validación futura cuando ERP implemente la restricción.
    });

    test('GRT-23: Validar pagador de flete obligatorio', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10.51',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}],
                retorno: 'Retorno de vehículo vacío',
                pagadorFlete: 'subcontratador',
                // Sin pagadorFleteData → la validación se dispara
            })
        );

        await test.step('Validar mensajes de campo obligatorio del pagador', async () => {
            await expect(page.getByRole('textbox', {name: 'Digite N° de RUC, nombre o razón social'})).toBeEmpty();
            await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        });
    });

    test('GRT-24: Validar subcontratador obligatorio', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10.45',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}],
                retorno: 'Transporte subcontratado',
                // Sin subcontratador → la validación se dispara
            })
        );

        await test.step('Validar mensaje de campo obligatorio', async () => {
            await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        });
    });

    test('GRT-25: Validar peso y cantidad inválidos', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '0',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}],
                decrementarCantidad: true,
            })
        );

        await test.step('Validar mensaje de peso inválido', async () => {
            await expect(page.getByRole('main')).toContainText('Debes ingresar un número mayor a 0');
        });
    });
});
