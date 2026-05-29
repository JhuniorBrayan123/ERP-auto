import type {DatosCliente} from './emision.types';

export interface DatosClienteConSelector extends DatosCliente {
    
    textoSelector?: string;
}
