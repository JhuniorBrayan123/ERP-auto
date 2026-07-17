import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {AbrirCrearConductor, SeleccionarTipoDocConductor, LlenarNumeroDocumentoConductor, CambiarCodigoConductorAManual, LlenarDireccionConductor, LlenarTelefonoConductor, LlenarEmailConductor, ClickCrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';

test.describe('CD-02 | Validación de Campos Obligatorios', {tag: ['@conductores', '@validacion']}, () => {

    test('SC-01: Validar nombre razón social obligatorio @CD-02.1', async ({conductor, page}) => {
        await conductor.realiza(AbrirCrearConductor());
        await conductor.realiza(SeleccionarTipoDocConductor('RUC'));
        await conductor.realiza(LlenarNumeroDocumentoConductor('20123456789'));
        await conductor.realiza(CambiarCodigoConductorAManual('CD99999'));
        await conductor.realiza(LlenarDireccionConductor('arequipa'));
        await conductor.realiza(LlenarTelefonoConductor('999999999'));
        await conductor.realiza(LlenarEmailConductor('test@test.com'));
        await conductor.realiza(ClickCrearConductor());

        await expect(page.locator('body')).toContainText('Campo obligatorio');
    });
});
