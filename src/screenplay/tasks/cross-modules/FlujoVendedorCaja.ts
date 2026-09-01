import { type Page } from '@playwright/test';
import { BuscarVendedorEnListado, AbrirAccionContextualVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import { NavegarACajaPos } from '@screenplay/tasks/cross-modules/NavegarA';
import { BuscarVendedorEnCaja } from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import { NavegarAListadoVendedores } from '@screenplay/tasks/cross-modules/NavegarAListadoVendedores';
import { SeleccionarPersonaEnCaja } from '@screenplay/tasks/cross-modules/SeleccionarPersonaEnCaja';
import { GuardarDatosVenta } from '@screenplay/tasks/cross-modules/GuardarDatosVenta';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { VendedoresTargets } from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import { EntidadesTargets } from '@screenplay/targets/clientes-proveedores/EntidadesTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export const CrearYDesactivarVendedor = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarVendedorEnListado(documento)(page);
        await AbrirAccionContextualVendedor('Desactivar vendedor')(page);
    };
    fn.displayName = `Crear y desactivar vendedor: ${documento}`;
    return fn;
};

export const VerificarVendedorNoEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarACajaPos()(page);
        await BuscarVendedorEnCaja(documento)(page);
    };
    fn.displayName = `Verificar vendedor no aparece en caja: ${documento}`;
    return fn;
};

// Helper: mostrar vendedores inactivos en el listado (filtro avanzado -> checkbox Estado)
const MostrarVendedoresInactivosEnListado = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnFiltrosAvanzados(page).click();
        // Usar el checkbox del filtro avanzado para estado (EntidadesTargets.checkboxFiltroEstado)
        await EntidadesTargets.checkboxFiltroEstado(page, 'Inactivo').click();
        await page.waitForTimeout(1000);
        await esperarCargaOverlay(page);
    };
    fn.displayName = 'Mostrar vendedores inactivos en listado';
    return fn;
};

// Helper: esperar a que aparezca la fila del vendedor y clickear su menú contextual
const ClickMenuContextualVendedor = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        // Esperar a que la fila exista en el tbody
        await VendedoresTargets.tbody(page).getByText(documento).first().waitFor({ state: 'visible', timeout: 15_000 });
        // Click en el botón de acciones (tres puntos) de esa fila
        await VendedoresTargets.opcionesFilaPorVendedor(page, documento).click();
    };
    fn.displayName = `Click menú contextual vendedor: ${documento}`;
    return fn;
};

export const ActivarVendedorYVerificarEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarAListadoVendedores()(page);
        await BuscarVendedorEnListado(documento)(page);
        await esperarCargaOverlay(page);
        await AbrirAccionContextualVendedor('Activar vendedor')(page);

        await NavegarACajaPos()(page);
        await BuscarVendedorEnCaja(documento)(page);
        await SeleccionarPersonaEnCaja(documento)(page);
        await GuardarDatosVenta()(page);
    };
    fn.displayName = `Activar vendedor y verificar en caja: ${documento}`;
    return fn;
};

export const LimpiarVendedor = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarAListadoVendedores()(page);
        await EliminarVendedor(documento)(page);
    };
    fn.displayName = `Limpiar vendedor: ${documento}`;
    return fn;
};