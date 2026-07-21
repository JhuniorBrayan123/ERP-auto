import {Page} from "@playwright/test";
import {NavegarANuevaGuiaRemision} from "@screenplay/tasks/cross-modules/NavegarA";
import {ContinuarCajaDeVenta} from "@screenplay/tasks/clientes-proveedores/conductores/NavegarCajaGuia";
import {BuscarConductorEnGuia} from "@screenplay/tasks/cross-modules/BuscarEntidadPos";

export const IniciarGuiaYBuscarConductor = (
    numeroDocumento: string,
    nombreCaja: string = 'Caja de venta',
) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarANuevaGuiaRemision()(page);
        await ContinuarCajaDeVenta(nombreCaja)(page);
        await BuscarConductorEnGuia(numeroDocumento)(page);
    };
    fn.displayName = 'Iniciar Guía y Buscar Conductor';
    return fn;
};