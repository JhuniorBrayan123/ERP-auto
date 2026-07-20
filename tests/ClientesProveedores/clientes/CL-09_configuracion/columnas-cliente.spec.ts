import {test, expect} from '@fixtures/clientes-proveedores/clientes.fixture';
import {
    AbrirConfiguracionColumnas,
    ToggleColumnaVisible,
    GuardarConfiguracionColumnas,
    ValidarColumnaObligatoria,
} from '@screenplay/tasks/clientes-proveedores/clientes/ConfiguracionCliente';
import {
    ColumnaVisibleEnTabla,
    ColumnaInvisibleEnTabla,
} from '@screenplay/questions/clientes-proveedores/ClienteQuestions';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

test.describe('CL-09 | Configuración de Columnas', {tag: ['@clientes', '@configuracion']}, () => {

    test('SC-01: Ocultar y mostrar columnas opcionales @CL-09.1', async ({cliente, page}) => {
        // Arrange
        await cliente.realiza(AbrirConfiguracionColumnas());
        
        // Act: Ocultar 'Correo'
        await cliente.realiza(ToggleColumnaVisible('Correo'));
        await cliente.realiza(GuardarConfiguracionColumnas());

        // Assert: No debe estar en la tabla
        await cliente.realiza(ColumnaInvisibleEnTabla('Correo'));

        // Revertir (Limpieza)
        await cliente.realiza(AbrirConfiguracionColumnas());
        await cliente.realiza(ToggleColumnaVisible('Correo'));
        await cliente.realiza(GuardarConfiguracionColumnas());
        await cliente.realiza(ColumnaVisibleEnTabla('Correo'));
    });

    test('SC-02: Validar que las columnas obligatorias no se pueden ocultar @CL-09.2', async ({cliente}) => {
        await cliente.realiza(AbrirConfiguracionColumnas());
        
        const camposObligatorios = [
            'Nombre / Razón Social',
            'Tipo de documento',
            'N° de documento',
            'Código de cliente',
            'Dirección',
            'Teléfono',
            'Estado',
        ];

        for (const campo of camposObligatorios) {
            await cliente.realiza(ValidarColumnaObligatoria(campo));
        }
        
        // No guardamos nada, solo cerramos validando que tienen la etiqueta 'Obligatorio'
    });
});
