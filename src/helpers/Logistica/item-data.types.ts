/**
 * Interfaces tipadas para los datos de configuración de cada tipo de item.
 * Usadas por los Page Objects y specs para pasar datos estructurados.
 */

/** Configuración de información adicional (categoría, subcategoría, marca) */
export interface InfoAdicional {
    categoria?: string;    // ej. 'REGRESION' — aplica a producto, servicio, insumo
    subcategoria?: string; // ej. 'AUTO-TEST'
    marca?: string;        // ej. 'AUTOMATIZADO'
}

/** Configuración de control de stock */
export interface StockConfig {
    tipo: 'estricto' | 'flexible';
    cantidadMaxima: string;
    cantidadMinima: string;
}

export interface AlmacenConfig {
    almacen: string;
}

/** Configuración de ISC (Impuesto Selectivo al Consumo) */
export interface ISCConfig {
    tipoSistema: 'Sistema al valor' | 'Aplicación al monto fijo';
    monto: string;
}

/** Campos adicionales opcionales del formulario */
export interface CamposAdicionales {
    texto?: string;
    fechaBotonName?: string; // name del botón de fecha a clickear
    numerico?: string;
}

/** Componente dentro de un combo (producto buscado por código) */
export interface ComponenteCombo {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
}

/** Insumo/producto dentro de una receta */
export interface InsumoReceta {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
}

/** Opción manual de un selector */
export interface OpcionSelector {
    nombre: string;
    precio: string;
}

/** Configuración de un selector de receta */
export interface SelectorConfig {
    titulo: string;
    opcionesManuales?: OpcionSelector[];
    itemBusqueda?: {
        codigo: string;
        textoSeleccion: string;
        precio: string;
    };
}

/** Producto dentro de una lista */
export interface ProductoListaItem {
    codigoBusqueda: string;
    textoSeleccion: string;
    variante?: string;
    equivalencia?: string;
    cantidadIncrementos?: number;
}
