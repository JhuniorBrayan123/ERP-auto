export interface ItemTest {
    codigo: string;
    nombre: string;
}

export interface ProveedorData {
    tipoDocumento: string;   
    numDocumento: string;
    razonSocial?: string;    
    direccion?: string;
    telefono?: string;
    email?: string;
}

export interface ComprobanteData {
    tipo: string;       
    serie: string;      
    numero: string;     
    cuc?: string;       
}

export interface CampoAdicionalTexto {
    tipo: 'texto';
    nombre: string;
    valor: string;
}

export interface CampoAdicionalFecha {
    tipo: 'fecha';
    nombre: string;
    
}

export interface CampoAdicionalSeleccion {
    tipo: 'seleccion';
    nombre: string;
    opciones: string[];
    seleccionPorDefecto?: boolean;
}

export interface CampoAdicionalNumero {
    tipo: 'numero';
    nombre: string;
    valor: string;
}

export type CampoAdicional =
    | CampoAdicionalTexto
    | CampoAdicionalFecha
    | CampoAdicionalSeleccion
    | CampoAdicionalNumero;
