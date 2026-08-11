import {expect, test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('GR-08 | Transportista — Validaciones', {tag: ['@puntoventa', '@guias']}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('SC-01: Validar campos obligatorios de guía transportista @GR-08.1', async ({page}) => {
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

    
    
    
    
    

    test('SC-02: Validar pagador de flete obligatorio @GR-08.2', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10.51',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}],
                retorno: 'Retorno de vehículo vacío',
                pagadorFlete: 'subcontratador',
                
            })
        );

        await test.step('Validar mensajes de campo obligatorio del pagador', async () => {
            await expect(page.getByRole('textbox', {name: 'Digite N° de RUC, nombre o razón social'})).toBeEmpty();
            await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        });
    });

    test('SC-03: Validar subcontratador obligatorio @GR-08.3', async ({cajero, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10.45',
                items: [{codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}],
                retorno: 'Transporte subcontratado',
                
            })
        );

        await test.step('Validar mensaje de campo obligatorio', async () => {
            await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        });
    });

    test('SC-04: Validar peso y cantidad inválidos @GR-08.4', async ({cajero, page}) => {
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
