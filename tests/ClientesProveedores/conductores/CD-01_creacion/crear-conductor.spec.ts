import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {generarConductor} from '@data/clientes-proveedores/conductores.data';

test.describe('CD-01 | Creación de Conductores', {tag: ['@conductores', '@creacion']}, () => {

    test('SC-01: Crear conductor DNI @CD-01.1', async ({conductor}) => {
        const datos = generarConductor();
        await conductor.realiza(CrearConductor(datos));
    });

    test('SC-02: Crear conductor con datos completos @CD-01.2', async ({conductor}) => {
        const datos = generarConductor({codigo: `C-manual-${Date.now()}`});
        await conductor.realiza(CrearConductor(datos));
    });
});
