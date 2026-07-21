import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {DatosConductorInput} from '@data/clientes-proveedores/conductores.data';

export const LlenarFormularioBasicoConductor = (datos: Partial<DatosConductorInput>) => {
    const fn = async (page: Page): Promise<void> => {
        if (datos.tipoDocumento) {
            await ConductoresTargets.selectTipoDocumento(page).click();
            await ConductoresTargets.opcionTipoDocumento(page, datos.tipoDocumento).click();
        }
        
        if (datos.numeroDocumento !== undefined) {
            await ConductoresTargets.inputNumeroDocumento(page).click();
            await ConductoresTargets.inputNumeroDocumento(page).fill(datos.numeroDocumento);
        }
        
        if (datos.nombreRazonSocial !== undefined) {
            await ConductoresTargets.inputRazonSocial(page).click();
            await ConductoresTargets.inputRazonSocial(page).fill(datos.nombreRazonSocial);
        }

        if (datos.codigo) {
            await ConductoresTargets.selectModoCodigo(page).click();
            await ConductoresTargets.opcionCodigoManual(page).click();
            await ConductoresTargets.inputCodigoManual(page).click();
            await ConductoresTargets.inputCodigoManual(page).fill(datos.codigo);
        }

        if (datos.categoriaLicencia) {
            await ConductoresTargets.selectTipoLicencia(page).click();
            await ConductoresTargets.opcionTipoLicencia(page, datos.categoriaLicencia).click();
        }

        if (datos.numeroLicencia) {
            await ConductoresTargets.inputNumeroLicencia(page).click();
            await ConductoresTargets.inputNumeroLicencia(page).fill(datos.numeroLicencia);
        }

        if (datos.zonaTransporte) {
            await ConductoresTargets.inputZonaTransporte(page).click();
            await ConductoresTargets.inputZonaTransporte(page).fill(datos.zonaTransporte);
        }

        if (datos.direccion) {
            await ConductoresTargets.inputDireccion(page).click();
            await ConductoresTargets.inputDireccion(page).fill(datos.direccion);
        }

        if (datos.telefono) {
            await ConductoresTargets.inputTelefono(page).click();
            await ConductoresTargets.inputTelefono(page).fill(datos.telefono);
        }

        if (datos.email) {
            await ConductoresTargets.inputEmail(page).click();
            await ConductoresTargets.inputEmail(page).fill(datos.email);
        }
    };
    fn.displayName = `Llenar formulario básico conductor: ${datos.nombreRazonSocial || 'parcial'}`;
    return fn;
};

export const CrearConductor = (datos: DatosConductorInput) => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.btnCrearConductor(page).click();
        await LlenarFormularioBasicoConductor(datos)(page);
        await ConductoresTargets.btnCrearConductorForm(page).click();
    };
    fn.displayName = `Crear conductor: ${datos.nombreRazonSocial}`;
    return fn;
};

export const CerrarModalExitoConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.btnCerrarModal(page).click();
    };
    fn.displayName = 'Cerrar modal de éxito (Conductor)';
    return fn;
};
