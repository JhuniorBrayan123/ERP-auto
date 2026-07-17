import {buscarTasks} from '../generic/BuscarEntidad';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

const b = buscarTasks(ProveedoresTargets);

export const BuscarProveedorEnListado = b.BuscarPorDocumento;
export const ValidarProveedorVisible = b.ValidarVisibleEnListado;
export const ValidarSinResultadosProveedor = b.ValidarSinResultados;
export const AbrirAccionContextualProveedor = b.AbrirAccionContextual;
export const AbrirAccionYEsperarDrapeProveedor = b.AbrirAccionYEsperarDrape;
