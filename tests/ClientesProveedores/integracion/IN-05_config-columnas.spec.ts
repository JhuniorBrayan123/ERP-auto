import { test, expect } from '@fixtures/clientes-proveedores/clientes.fixture';
import { AbrirConfiguracionColumnas, SeleccionarColumna, GuardarConfiguracionColumnas } from '@screenplay/tasks/cross-modules/ConfigurarColumnas';

test.describe('IN-05 | Configuración de Columnas', { tag: ['@integracion', '@columnas'] }, () => {

    test('SC-01: Configurar columnas del listado por actor comercial @IN-05.1', async ({ cliente, page }) => {

        await cliente.realiza(AbrirConfiguracionColumnas());
        await cliente.realiza(SeleccionarColumna('Correo'));
        await cliente.realiza(GuardarConfiguracionColumnas());

        await expect(page.locator('thead')).toContainText('Correo');
    });
});
