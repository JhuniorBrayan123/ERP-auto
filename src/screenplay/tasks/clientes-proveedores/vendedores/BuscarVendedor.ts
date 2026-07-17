import {buscarTasks} from '../generic/BuscarEntidad';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

const b = buscarTasks(VendedoresTargets);

export const BuscarVendedorEnListado = b.BuscarPorDocumento;
export const ValidarVendedorVisible = b.ValidarVisibleEnListado;
export const ValidarSinResultadosVendedor = b.ValidarSinResultados;
export const AbrirAccionContextualVendedor = b.AbrirAccionContextual;
export const AbrirAccionYEsperarDrapeVendedor = b.AbrirAccionYEsperarDrape;
