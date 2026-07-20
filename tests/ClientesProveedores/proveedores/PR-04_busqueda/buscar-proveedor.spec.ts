import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {
    ProveedorVisibleEnListado,
    SinResultadosBusqueda,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorIdentificacionExtranjera} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-04 | Búsqueda General de Proveedores', {tag: ['@proveedores', '@busqueda']}, () => {

    test('SC-01: Buscar proveedor por nombre y documento @PR-04.1', async ({proveedorActor}) => {
        const datos = generarProveedorIdentificacionExtranjera();
        await proveedorActor.realiza(CrearProveedor(datos));

        
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.nombreRazonSocial));
        await proveedorActor.realiza(ProveedorVisibleEnListado(datos.numeroDocumento));

        
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(datos.nombreRazonSocial));

        
        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });

    test('SC-02: Filtros avanzados (Tipo Documento) @PR-04.2', async ({proveedorActor, page}) => {
        const datos = generarProveedorIdentificacionExtranjera();
        await proveedorActor.realiza(CrearProveedor(datos));

        
        await ProveedoresTargets.btnFiltrosAvanzados(page).click();
        await ProveedoresTargets.filtroTipoDocumento(page).click();
        await ProveedoresTargets.filtroTipoDocEnTabla(page, 'Identification.Number.IN.Doc.').click();
        await ProveedoresTargets.btnOpcionesGenerales(page).click(); 
        
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(datos.numeroDocumento));

        
        await ProveedoresTargets.btnBorrarFiltros(page).click();

        
        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });

    test('SC-03: Buscar proveedor inexistente @PR-04.3', async ({proveedorActor}) => {
        await proveedorActor.realiza(BuscarProveedorEnListado('INVENTADO-NO-EXISTE-9999'));
        await proveedorActor.realiza(SinResultadosBusqueda());
    });
});
