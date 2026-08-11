import { expect, type Page } from '@playwright/test';
import { ClientesTargets } from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import type { DatosClienteInput } from '@data/clientes-proveedores/clientes.data';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export const NavegarAClientes = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnCrearCliente(page).waitFor({ state: 'visible', timeout: 15_000 });
    };
    fn.displayName = 'Navegar a submódulo Clientes';
    return fn;
};

export const AbrirCrearCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnCrearCliente(page).click();
    };
    fn.displayName = 'Abrir formulario Crear cliente';
    return fn;
};

export const SeleccionarTipoDocCliente = (tipo: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.selectTipoDocumento(page).click();
        await ClientesTargets.opcionDocumentoEnDropdown(page, tipo).click();
    };
    fn.displayName = `Seleccionar tipo documento: ${tipo}`;
    return fn;
};

export const LlenarNumeroDocumentoCliente = (numero: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputNumeroDocumento(page);
        await input.click();
        await input.fill(numero);
    };
    fn.displayName = `Llenar N° documento: ${numero}`;
    return fn;
};

export const LlenarNombreRazonSocialCliente = (nombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputNombreRazonSocial(page);
        await input.click();
        await input.fill(nombre);
    };
    fn.displayName = `Llenar nombre/razón social: ${nombre}`;
    return fn;
};

export const CambiarCodigoAManual = (codigo: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.toggleTipoCodigo(page).getByText('Automático').click();
        await ClientesTargets.opcionManual(page).click();
        const input = ClientesTargets.inputCodigo(page);
        await input.click();
        await input.fill(codigo);
    };
    fn.displayName = `Cambiar código a manual: ${codigo}`;
    return fn;
};

export const LlenarDireccionCliente = (direccion: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputDireccion(page);
        await input.click();
        await input.fill(direccion);
    };
    fn.displayName = `Llenar dirección: ${direccion}`;
    return fn;
};

export const LlenarTelefonoCliente = (telefono: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputTelefono(page);
        await input.click();
        await input.fill(telefono);
    };
    fn.displayName = `Llenar teléfono: ${telefono}`;
    return fn;
};

export const LlenarEmailCliente = (email: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputEmail(page);
        await input.click();
        await input.fill(email);
    };
    fn.displayName = `Llenar email: ${email}`;
    return fn;
};

export const AgregarCampoAdicional = (nombre: string, valor: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnNuevoCampoAdicional(page).click();
        await ClientesTargets.tipoCampoTexto(page).click();
        
        await ClientesTargets.inputValorCampo(page).fill(valor);
        
        await ClientesTargets.inputNombreCampo(page).fill(nombre);
        await expect(ClientesTargets.inputNombreCampo(page)).toHaveValue(nombre, {timeout: 5_000});

        await ClientesTargets.btnCrearCampo(page).click();
        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible();
        await expect(page.locator('body')).toContainText('El campo fue creado exitosamente');
        await ClientesTargets.btnCerrarModal(page).click();
    };
    fn.displayName = `Agregar campo adicional: ${nombre}=${valor}`;
    return fn;
};

export const ClickCrearCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnGuardarCliente(page).click();
    };
    fn.displayName = 'Click en Crear cliente';
    return fn;
};

export const CerrarModalExito = () => {
    const fn = async (page: Page): Promise<void> => {
        const btn = ClientesTargets.btnCerrarModal(page);
        try {
            await btn.waitFor({state: 'visible', timeout: 2_000});
            await btn.click();
            await esperarCargaOverlay(page).catch(() => { });
        } catch {
            // El modal ya estaba cerrado: no-op.
        }
    };
    fn.displayName = 'Cerrar modal de éxito';
    return fn;
};

export const CrearCliente = (datos: DatosClienteInput) => {
    const fn = async (page: Page): Promise<void> => {
        await AbrirCrearCliente()(page);
        await SeleccionarTipoDocCliente(datos.tipoDocumento)(page);
        await LlenarNumeroDocumentoCliente(datos.numeroDocumento)(page);
        await LlenarNombreRazonSocialCliente(datos.nombreRazonSocial)(page);
        await CambiarCodigoAManual(datos.codigo)(page);
        await LlenarDireccionCliente(datos.direccion)(page);
        await LlenarTelefonoCliente(datos.telefono)(page);
        await LlenarEmailCliente(datos.email)(page);

        if (datos.campoAdicional) {
            await AgregarCampoAdicional(datos.campoAdicional.nombre, datos.campoAdicional.valor)(page);
        }

        if (datos.estado === 'Inactivo') {
            await ClientesTargets.estadoSelect(page).click();
            await ClientesTargets.estadoInactivo(page).click();
        }

        await ClickCrearCliente()(page);
        await esperarCargaOverlay(page);
        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible({ timeout: 30_000 });
        await expect(ClientesTargets.mensajeExitoCreacion(page)).toBeVisible();
        await CerrarModalExito()(page);
    };
    fn.displayName = `Crear Cliente — ${datos.nombreRazonSocial}`;
    return fn;
};
