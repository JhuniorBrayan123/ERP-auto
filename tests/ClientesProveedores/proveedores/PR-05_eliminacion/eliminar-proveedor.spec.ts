import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    BuscarProveedorEnListado,
    ValidarSinResultados,
    AbrirAccionContextualProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {
    ClickEliminarConfirmar,
} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-05 | Eliminación de Proveedor', { tag: ['@proveedores', '@eliminacion', '@PR-05'] }, () => {

    test('PR-05.1: Eliminar proveedor', async ({ proveedorActor, page }) => {
        const datosProveedor = generarProveedorRUC();

        
        await proveedorActor.realiza(CrearProveedor(datosProveedor));
        
        await proveedorActor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Eliminar'));
        await proveedorActor.realiza(ClickEliminarConfirmar());
        await proveedorActor.realiza(CerrarModalExitoProveedor())
        await proveedorActor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        const sinResultados = await proveedorActor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
