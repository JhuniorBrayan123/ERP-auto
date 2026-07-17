import {crearTasksEntidad} from '../generic/CrearEntidad';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

const c = crearTasksEntidad(VendedoresTargets, 'vendedor');

export const CrearVendedor = c.Crear;
export const AbrirCrearVendedor = c.AbrirCrear;
export const SeleccionarTipoDocVendedor = c.SeleccionarTipoDoc;
export const LlenarNumeroDocumentoVendedor = c.LlenarNumeroDocumento;
export const LlenarNombreRazonSocialVendedor = c.LlenarNombreRazonSocial;
export const CambiarCodigoVendedorAManual = c.CambiarCodigoAManual;
export const LlenarDireccionVendedor = c.LlenarDireccion;
export const LlenarTelefonoVendedor = c.LlenarTelefono;
export const LlenarEmailVendedor = c.LlenarEmail;
export const ClickCrearVendedor = c.ClickCrear;
export const CerrarModalExitoVendedor = c.CerrarModalExito;
