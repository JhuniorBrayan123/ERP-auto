import {expect, type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {DatosProveedorInput} from '@data/clientes-proveedores/proveedores.data';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const AbrirCrearProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnCrearProveedor(page).click();
    };
    fn.displayName = 'Abrir formulario Crear proveedor';
    return fn;
};

export const LlenarFormularioBasicoProveedor = (datos: Partial<DatosProveedorInput>) => {
    const fn = async (page: Page): Promise<void> => {
        if (datos.tipoDocumento) {
            await ProveedoresTargets.selectTipoDocumento(page).click();
            await ProveedoresTargets.opcionTipoDocumento(page, datos.tipoDocumento).click();
        }
        
        if (datos.numeroDocumento !== undefined) {
            await ProveedoresTargets.inputNumeroDocumento(page).click();
            await ProveedoresTargets.inputNumeroDocumento(page).fill(datos.numeroDocumento);
        }
        
        if (datos.nombreRazonSocial !== undefined) {
            await ProveedoresTargets.inputRazonSocial(page).click();
            await ProveedoresTargets.inputRazonSocial(page).fill(datos.nombreRazonSocial);
        }

        if (datos.codigo) {
            await ProveedoresTargets.selectModoCodigo(page).click();
            await ProveedoresTargets.opcionCodigoManual(page).click();
            await ProveedoresTargets.inputCodigoManual(page).click();
            await ProveedoresTargets.inputCodigoManual(page).fill(datos.codigo);
        }

        if (datos.direccion) {
            await ProveedoresTargets.inputDireccion(page).click();
            await ProveedoresTargets.inputDireccion(page).fill(datos.direccion);
        }

        if (datos.telefono) {
            await ProveedoresTargets.inputTelefono(page).click();
            await ProveedoresTargets.inputTelefono(page).fill(datos.telefono);
        }

        if (datos.email) {
            await ProveedoresTargets.inputEmail(page).click();
            await ProveedoresTargets.inputEmail(page).fill(datos.email);
        }
    };
    fn.displayName = `Llenar formulario básico proveedor: ${datos.nombreRazonSocial || 'parcial'}`;
    return fn;
};

export const CrearProveedor = (datos: DatosProveedorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnCrearProveedor(page).click();
        await LlenarFormularioBasicoProveedor(datos)(page);
        await ProveedoresTargets.btnCrearProveedorForm(page).click();

        
        await esperarCargaOverlay(page);
        await expect(ProveedoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 30_000});
        await expect(ProveedoresTargets.mensajeExitoCreacion(page)).toBeVisible();
        await ProveedoresTargets.btnCerrarModal(page).click();
    };
    fn.displayName = `Crear proveedor: ${datos.nombreRazonSocial}`;
    return fn;
};

export const CerrarModalExito = () => {
    const fn = async (page: Page): Promise<void> => {
        const btn = ProveedoresTargets.btnCerrarModal(page);
        try {
            await btn.waitFor({state: 'visible', timeout: 2_000});
            await btn.click();
        } catch {
            
        }
    };
    fn.displayName = 'Cerrar modal de éxito';
    return fn;
};

export const CerrarModalExitoProveedor = CerrarModalExito;

export const IntentarCrearProveedor = (datos: DatosProveedorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnCrearProveedor(page).click();
        await LlenarFormularioBasicoProveedor(datos)(page);
        await ProveedoresTargets.btnCrearProveedorForm(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = `Intentar crear proveedor (sin validación): ${datos.nombreRazonSocial}`;
    return fn;
};
