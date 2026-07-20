import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    AbrirMenuDescargasProveedor,
    DescargarProveedoresFiltrados,
    DescargarTodosLosProveedores,
} from '@screenplay/tasks/clientes-proveedores/proveedores/ExportarProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {generarProveedorDNI} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-05 | Exportación de Proveedores', {tag: ['@proveedores', '@exportacion']}, () => {

    test('SC-01: Descargar proveedores filtrados @PR-05.1', async ({proveedorActor, page}) => {
        // Arrange
        const datos = generarProveedorDNI();
        await proveedorActor.realiza(CrearProveedor(datos));
        
        // Act: Filtro avanzado por DNI
        await ProveedoresTargets.btnFiltrosAvanzados(page).click();
        await ProveedoresTargets.filtroTipoDocumento(page).click();
        await ProveedoresTargets.filtroTipoDocEnTabla(page, 'DNI').click();
        await ProveedoresTargets.btnOpcionesGenerales(page).click(); // Click fuera

        await proveedorActor.realiza(AbrirMenuDescargasProveedor());
        await proveedorActor.realiza(DescargarProveedoresFiltrados());

        // Teardown
        await ProveedoresTargets.btnBorrarFiltros(page).click();
    });

    test('SC-02: Descargar todos los proveedores @PR-05.2', async ({proveedorActor, page}) => {
        // Arrange: Asegurar que no hay filtros
        await ProveedoresTargets.btnBorrarFiltros(page).click().catch(() => {});

        // Act
        await proveedorActor.realiza(AbrirMenuDescargasProveedor());
        await proveedorActor.realiza(DescargarTodosLosProveedores());
    });
});
