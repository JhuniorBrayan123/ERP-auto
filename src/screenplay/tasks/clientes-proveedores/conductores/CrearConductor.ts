import {crearTasksEntidad} from '../generic/CrearEntidad';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

const c = crearTasksEntidad(ConductoresTargets, 'conductor');

export const CrearConductor = c.Crear;
export const AbrirCrearConductor = c.AbrirCrear;
export const SeleccionarTipoDocConductor = c.SeleccionarTipoDoc;
export const LlenarNumeroDocumentoConductor = c.LlenarNumeroDocumento;
export const LlenarNombreRazonSocialConductor = c.LlenarNombreRazonSocial;
export const CambiarCodigoConductorAManual = c.CambiarCodigoAManual;
export const LlenarDireccionConductor = c.LlenarDireccion;
export const LlenarTelefonoConductor = c.LlenarTelefono;
export const LlenarEmailConductor = c.LlenarEmail;
export const ClickCrearConductor = c.ClickCrear;
export const CerrarModalExitoConductor = c.CerrarModalExito;
