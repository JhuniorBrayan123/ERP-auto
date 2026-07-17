import {crearTasksEntidad} from '../generic/CrearEntidad';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

const c = crearTasksEntidad(ProveedoresTargets, 'proveedor');

export const CrearProveedor = c.Crear;
export const AbrirCrearProveedor = c.AbrirCrear;
export const SeleccionarTipoDocProveedor = c.SeleccionarTipoDoc;
export const LlenarNumeroDocumentoProveedor = c.LlenarNumeroDocumento;
export const LlenarNombreRazonSocialProveedor = c.LlenarNombreRazonSocial;
export const CambiarCodigoProveedorAManual = c.CambiarCodigoAManual;
export const LlenarDireccionProveedor = c.LlenarDireccion;
export const LlenarTelefonoProveedor = c.LlenarTelefono;
export const LlenarEmailProveedor = c.LlenarEmail;
export const ClickCrearProveedor = c.ClickCrear;
export const CerrarModalExitoProveedor = c.CerrarModalExito;
