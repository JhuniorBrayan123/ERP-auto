export interface InfoAdicional {
    categoria?: string;    
    subcategoria?: string; 
    marca?: string;        
}

export interface StockConfig {
    tipo: 'estricto' | 'flexible';
    cantidadMaxima: string;
    cantidadMinima: string;
}

export interface AlmacenConfig {
    almacen: string;
}

export interface ISCConfig {
    tipoSistema: 'Sistema al valor' | 'Aplicación al monto fijo';
    monto: string;
}

export interface CamposAdicionales {
    texto?: string;
    fechaBotonName?: string; 
    numerico?: string;
}

export interface ComponenteCombo {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
}

export interface InsumoReceta {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
}

export interface OpcionSelector {
    nombre: string;
    precio: string;
}

export interface SelectorConfig {
    titulo: string;
    opcionesManuales?: OpcionSelector[];
    itemBusqueda?: {
        codigo: string;
        textoSeleccion: string;
        precio: string;
    };
}

export interface ProductoListaItem {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
    cantidadIncrementos?: number;
}
