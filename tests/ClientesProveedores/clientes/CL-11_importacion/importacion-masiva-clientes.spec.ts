import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {
    AbrirImportacionMasiva,
    SubirArchivoExcel,
    ProcesarImportacion,
    FinalizarImportacionVolverInicio,
    EliminarMasivamente,
} from '@screenplay/tasks/clientes-proveedores/clientes/ImportacionMasivaCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {
    MensajeExitoCargaMasivaVisible,
    MensajeErrorCargaMasivaVisible,
    MensajeEliminacionMasivaVisible,
    ClienteVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-11 | Importación Masiva de Clientes', {tag: ['@clientes', '@importacion']}, () => {

    test('SC-01: Validar creación masiva con Excel correcto @CL-11.1', async ({cliente, page}) => {
        
        await cliente.realiza(AbrirImportacionMasiva());
        await cliente.realiza(SubirArchivoExcel('FORMATO_SUBIDA_CLIENTES.xlsx'));
        await cliente.realiza(ProcesarImportacion());

        
        await cliente.realiza(MensajeExitoCargaMasivaVisible());
        await cliente.realiza(FinalizarImportacionVolverInicio());

        
        await cliente.realiza(BuscarClienteEnListado('masivos'));
        await cliente.realiza(ClienteVisibleEnListado('Juan Carlos Pérez Gómez-masivos'));
        
        
        await cliente.realiza(EliminarMasivamente());
        await cliente.realiza(MensajeEliminacionMasivaVisible());
    });

    test('SC-02: Validar errores en creación masiva de clientes @CL-11.2', async ({cliente, page}) => {
        
        await cliente.realiza(AbrirImportacionMasiva());
        await cliente.realiza(SubirArchivoExcel('FORMATO_SUBIDA_CLIENTES -ERROR.xlsx'));
        await cliente.realiza(ProcesarImportacion());

        
        await cliente.realiza(MensajeErrorCargaMasivaVisible());
    });
});
