import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    BuscarProveedorEnListado,
    ValidarProveedorVisible,
    AbrirAccionContextualProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {
    EditarNombreProveedor,
    ClickGuardarCambiosProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { EliminarProveedor } from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-03 | Edición de Proveedor', { tag: ['@proveedores', '@edicion', '@PR-03'] }, () => {

    test('PR-03.1: Editar nombre de proveedor y validar en bitácora', async ({ proveedorActor, page }) => {
        const datosProveedor = generarProveedorRUC();
        const nombreEditado = `${datosProveedor.nombreRazonSocial} EDITADO`;

        
        await proveedorActor.realiza(CrearProveedor(datosProveedor));
        await proveedorActor.realiza(CerrarModalExitoProveedor());

        
        await proveedorActor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Editar'));

        
        await proveedorActor.realiza(EditarNombreProveedor(nombreEditado));
        await proveedorActor.realiza(ClickGuardarCambiosProveedor());

        
        const hayExito = await proveedorActor.pregunta(CuerpoContieneTexto('actualizado'));
        expect(hayExito).toBe(true);

        
        await proveedorActor.realiza(BuscarProveedorEnListado(nombreEditado));
        const visible = await proveedorActor.pregunta(ValidarProveedorVisible(nombreEditado));
        expect(visible).toBe(true);

        await proveedorActor.realiza(EliminarProveedor(datosProveedor.numeroDocumento));
    });
});
