import {buscarTasks} from '../generic/BuscarEntidad';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

const b = buscarTasks(ConductoresTargets);

export const BuscarConductorEnListado = b.BuscarPorDocumento;
export const ValidarConductorVisible = b.ValidarVisibleEnListado;
export const ValidarSinResultadosConductor = b.ValidarSinResultados;
export const AbrirAccionContextualConductor = b.AbrirAccionContextual;
export const AbrirAccionYEsperarDrapeConductor = b.AbrirAccionYEsperarDrape;
