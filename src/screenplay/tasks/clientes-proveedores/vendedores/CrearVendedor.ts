import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import {DatosVendedorInput} from '@data/clientes-proveedores/vendedores.data';
import {esperarCargaOverlay, esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const AbrirCrearVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnCrearVendedor(page).click();
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Abrir formulario Crear vendedor';
    return fn;
};

export const LlenarFormularioBasicoVendedor = (datos: Partial<DatosVendedorInput>) => {
    const fn = async (page: Page): Promise<void> => {
        if (datos.tipoDocumento) {
            await VendedoresTargets.selectTipoDocumento(page).click();
            await VendedoresTargets.opcionTipoDocumento(page, datos.tipoDocumento).click();
        }

        if (datos.numeroDocumento !== undefined) {
            await VendedoresTargets.inputNumeroDocumento(page).click();
            await VendedoresTargets.inputNumeroDocumento(page).fill(datos.numeroDocumento);
        }

        if (datos.nombreRazonSocial !== undefined) {
            await VendedoresTargets.inputRazonSocial(page).click();
            await VendedoresTargets.inputRazonSocial(page).fill(datos.nombreRazonSocial);
        }

        if (datos.codigo) {
            await VendedoresTargets.selectModoCodigo(page).click();
            await VendedoresTargets.opcionCodigoManual(page).click();
            await VendedoresTargets.inputCodigoManual(page).click();
            await VendedoresTargets.inputCodigoManual(page).fill(datos.codigo);
        }

        if (datos.metaMonto !== undefined) {
            await VendedoresTargets.inputMetaMonto(page).click();
            await VendedoresTargets.inputMetaMonto(page).fill(datos.metaMonto);
        }

        if (datos.metaCantidad !== undefined) {
            await VendedoresTargets.inputMetaCantidad(page).click();
            await VendedoresTargets.inputMetaCantidad(page).fill(datos.metaCantidad);
        }

        if (datos.zonaVentas) {
            await VendedoresTargets.inputZonaVentas(page).click();
            await VendedoresTargets.inputZonaVentas(page).fill(datos.zonaVentas);
        }

        if (datos.direccion) {
            await VendedoresTargets.inputDireccion(page).click();
            await VendedoresTargets.inputDireccion(page).fill(datos.direccion);
        }

        if (datos.telefono) {
            await VendedoresTargets.inputTelefono(page).click();
            await VendedoresTargets.inputTelefono(page).fill(datos.telefono);
        }

        if (datos.email) {
            await VendedoresTargets.inputEmail(page).click();
            await VendedoresTargets.inputEmail(page).fill(datos.email);
        }
    };
    fn.displayName = `Llenar formulario básico vendedor: ${datos.nombreRazonSocial || 'parcial'}`;
    return fn;
};

export const CrearVendedor = (datos: DatosVendedorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnCrearVendedor(page).click();
        await LlenarFormularioBasicoVendedor(datos)(page);
        await VendedoresTargets.btnCrearVendedorForm(page).click();
        await VendedoresTargets.btnCerrarModal(page).click();
    };
    fn.displayName = `Crear vendedor: ${datos.nombreRazonSocial}`;
    return fn;
};
export const CrearVendedorIncompleto = (datos: DatosVendedorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnCrearVendedor(page).click();
        await LlenarFormularioBasicoVendedor(datos)(page);
        await VendedoresTargets.btnCrearVendedorForm(page).click();
    };
    fn.displayName = `Crear vendedor: ${datos.nombreRazonSocial}`;
    return fn;
};

export const CerrarModalExitoVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        const btn = VendedoresTargets.btnCerrarModal(page);
        try {
            await btn.waitFor({state: 'visible', timeout: 2_000});
            await btn.click();
        } catch {
            // El modal ya estaba cerrado (lo cerró el task compuesto): no-op.
        }
    };
    fn.displayName = 'Cerrar modal de éxito (Vendedor)';
    return fn;
};

export const IntentarCrearVendedor = (datos: DatosVendedorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.btnCrearVendedor(page).click();
        await LlenarFormularioBasicoVendedor(datos)(page);
        await VendedoresTargets.btnCrearVendedorForm(page).click();
        await esperarCargaOverlay(page);
    };
    fn.displayName = `Intentar crear vendedor (sin validación): ${datos.nombreRazonSocial}`;
    return fn;
};
