import {Page} from "@playwright/test";
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado
} from "@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor";
import {ToggleSliderEstadoConductor} from "@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor";

export const CambiarEstadoConductor = (numeroDocumento: string, accion: 'Desactivar conductor' | 'Activar conductor') => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarConductorEnListado(numeroDocumento)(page);
        await AbrirAccionContextualConductor(accion)(page);
        await ToggleSliderEstadoConductor()(page);
    };
    fn.displayName = `Cambiar Estado de Conductor: ${accion}`;
    return fn;
};