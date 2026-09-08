import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

export const BuscarClienteEnListado = (criterio: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputBuscar(page);
        await input.click();
        await input.fill(criterio);
        await page.keyboard.press('Enter');
        await esperarCargaOverlaySiVisible(page).catch(() => {});
    };
    fn.displayName = `Buscar cliente por: ${criterio}`;
    return fn;
};

export const ValidarClienteVisibleEnListado = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.tbody(page)).toContainText(texto);
    };
    fn.displayName = `Validar cliente visible en listado: ${texto}`;
    return fn;
};

export const ValidarSinResultados = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.celdaSinResultados(page)).toBeVisible();
    };
    fn.displayName = 'Validar que no hay resultados';
    return fn;
};

const ACCION_A_TARGET: Record<string, (page: Page) => import('@playwright/test').Locator> = {
    'Ver cliente': ClientesTargets.opcionVerCliente,
    'Editar cliente': ClientesTargets.opcionEditarCliente,
    'Ver bitácora': ClientesTargets.opcionVerBitacora,
    'Ver ventas al cliente': ClientesTargets.opcionVerVentas,
    'Ver notas adicionales': ClientesTargets.opcionVerNotas,
    'Eliminar cliente': ClientesTargets.opcionEliminarCliente,
};

export const AbrirAccionContextualCliente = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        const target = ACCION_A_TARGET[accion];
        if (target) {
            await target(page).click();
        } else {
            await page.getByText(accion).click();
        }
    };
    fn.displayName = `Abrir acción contextual: ${accion}`;
    return fn;
};

export const AbrirAccionYEsperarDrape = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        const target = ACCION_A_TARGET[accion];
        if (target) {
            await target(page).click();
        } else {
            await page.getByText(accion).click();
        }
        await ClientesTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = `Abrir acción (con drape): ${accion}`;
    return fn;
};

type FiltroAvanzado = 'nombre' | 'documento' | 'telefono';

const FILTRO_A_TARGET: Record<FiltroAvanzado, (page: Page) => import('@playwright/test').Locator> = {
    nombre: ClientesTargets.inputFiltroRazonSocial,
    documento: ClientesTargets.inputFiltroDocumento,
    telefono: ClientesTargets.inputFiltroTelefono,
};

export const BuscarClienteConFiltroAvanzado = (tipo: FiltroAvanzado, valor: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnVerFiltros(page).click();
        const input = FILTRO_A_TARGET[tipo](page);
        await input.click();
        await input.fill(valor);
        await page.keyboard.press('Enter');
        await esperarCargaOverlaySiVisible(page).catch(() => {});
    };
    fn.displayName = `Buscar por filtro ${tipo}: ${valor}`;
    return fn;
};
