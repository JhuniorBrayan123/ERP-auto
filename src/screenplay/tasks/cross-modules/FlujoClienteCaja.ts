import {type Page} from '@playwright/test';
import {CrearCliente} from '@screenplay/tasks/clientes-proveedores/clientes/CrearCliente';
import {BuscarClienteEnListado} from '@screenplay/tasks/clientes-proveedores/clientes/BuscarCliente';
import {ToggleSliderEstado} from '@screenplay/tasks/clientes-proveedores/clientes/ToggleEstadoCliente';
import {NavegarACajaPos} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarClienteEnCaja} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {NavegarAListadoClientes} from '@screenplay/tasks/cross-modules/NavegarAListadoClientes';
import {SeleccionarPersonaEnCaja} from '@screenplay/tasks/cross-modules/SeleccionarPersonaEnCaja';
import {GuardarDatosVenta} from '@screenplay/tasks/cross-modules/GuardarDatosVenta';
import {EliminarCliente} from '@screenplay/tasks/clientes-proveedores/clientes/EliminarCliente';

export const CrearYDesactivarCliente = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarClienteEnListado(documento)(page);
        await ToggleSliderEstado()(page);
    };
    fn.displayName = `Crear y desactivar cliente: ${documento}`;
    return fn;
};

export const VerificarClienteNoEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarACajaPos()(page);
        await BuscarClienteEnCaja(documento)(page);
    };
    fn.displayName = `Verificar cliente no aparece en caja: ${documento}`;
    return fn;
};

export const ActivarClienteYVerificarEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarAListadoClientes()(page);
        await BuscarClienteEnListado(documento)(page);
        await ToggleSliderEstado()(page);
        
        await NavegarACajaPos()(page);
        await BuscarClienteEnCaja(documento)(page);
        await SeleccionarPersonaEnCaja(documento)(page);
        await GuardarDatosVenta()(page);
    };
    fn.displayName = `Activar cliente y verificar en caja: ${documento}`;
    return fn;
};

export const LimpiarCliente = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await NavegarAListadoClientes()(page);
        await EliminarCliente(documento)(page);
    };
    fn.displayName = `Limpiar cliente: ${documento}`;
    return fn;
};