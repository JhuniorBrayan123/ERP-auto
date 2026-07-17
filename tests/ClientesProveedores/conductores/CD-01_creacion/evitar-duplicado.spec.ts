import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor, AbrirCrearConductor, SeleccionarTipoDocConductor, LlenarNumeroDocumentoConductor, LlenarNombreRazonSocialConductor, LlenarDireccionConductor, LlenarTelefonoConductor, LlenarEmailConductor, ClickCrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {generarConductor} from '@data/clientes-proveedores/conductores.data';

test.describe('CD-01b | Evitar Conductor Duplicado', {tag: ['@conductores', '@duplicado']}, () => {

    test('SC-01: No permitir crear conductor con mismo documento @CD-01.3', async ({conductor, page}) => {
        const datos = generarConductor();
        await conductor.realiza(CrearConductor(datos));

        await conductor.realiza(AbrirCrearConductor());
        await conductor.realiza(SeleccionarTipoDocConductor(datos.tipoDocumento));
        await conductor.realiza(LlenarNumeroDocumentoConductor(datos.numeroDocumento));
        await conductor.realiza(LlenarNombreRazonSocialConductor(`${datos.nombreRazonSocial}-dup`));
        await conductor.realiza(LlenarDireccionConductor(datos.direccion));
        await conductor.realiza(LlenarTelefonoConductor(datos.telefono));
        await conductor.realiza(LlenarEmailConductor(datos.email));
        await conductor.realiza(ClickCrearConductor());

        await expect(page.locator('body')).toContainText(/ya esta registrado/);
    });
});
