import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    AbrirMenuDescargasProveedor,
    DescargarProveedoresFiltrados,
    DescargarTodosLosProveedores,
} from '@screenplay/tasks/clientes-proveedores/proveedores/ExportarProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {generarProveedorDNI} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-05 | Exportación de Proveedores', {tag: ['@proveedores', '@exportacion']}, () => {

    test('SC-01: Descargar proveedores filtrados @PR-05.1', async ({proveedorActor, page}) => {
        
        const datos = generarProveedorDNI();
        await proveedorActor.realiza(CrearProveedor(datos));
        
        
        await ProveedoresTargets.btnFiltrosAvanzados(page).click();
        await ProveedoresTargets.filtroTipoDocumento(page).click();
        await ProveedoresTargets.opcionFiltroTipoDoc(page, 'DNI').click();

        await proveedorActor.realiza(AbrirMenuDescargasProveedor());
        await proveedorActor.realiza(DescargarProveedoresFiltrados());

        
        await ProveedoresTargets.btnBorrarFiltros(page).click();

        
        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });

    test('SC-02: Descargar todos los proveedores @PR-05.2', async ({proveedorActor, page}) => {
        
        await ProveedoresTargets.btnBorrarFiltros(page).click().catch(() => {});

        
        await proveedorActor.realiza(AbrirMenuDescargasProveedor());
        await proveedorActor.realiza(DescargarTodosLosProveedores());
    });
});
