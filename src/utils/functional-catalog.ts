export type FunctionalPreset = {
    module: string;
    screen: string;
    flowStep: string;
    userMessage: string;
    technicalDetail: string;
};

export const FUNCTIONAL_CATALOG = {
    movimientos: {
        navegarIngresos: {
            module: 'Logistica',
            screen: 'Movimientos > Ingresos',
            flowStep: 'Ingresar a la pantalla de ingresos',
            userMessage: 'No se pudo abrir la pantalla de ingresos para continuar el flujo.',
            technicalDetail: 'Falla en la navegación del módulo Productos y servicios hacia Ingresos.',
        },
        definirAlmacenMotivo: {
            module: 'Logistica',
            screen: 'Registro de movimiento',
            flowStep: 'Configurar almacén y motivo del movimiento',
            userMessage: 'No se pudo configurar el almacén o motivo del movimiento.',
            technicalDetail: 'Falla al interactuar con selectores de almacén/motivo en el formulario.',
        },
        registrarIngreso: {
            module: 'Logistica',
            screen: 'Registro de movimiento',
            flowStep: 'Registrar ingreso de almacén',
            userMessage: 'No se pudo registrar el ingreso de almacén.',
            technicalDetail: 'Falla al ejecutar el registro del ingreso o retorno al listado.',
        },
        verificarBitacora: {
            module: 'Logistica',
            screen: 'Listado de movimientos',
            flowStep: 'Validar evento en bitácora',
            userMessage: 'No se pudo validar el evento esperado en la bitácora del movimiento.',
            technicalDetail: 'Falla al abrir bitácora o localizar el evento solicitado.',
        },
        clonarMovimiento: {
            module: 'Logistica',
            screen: 'Listado de movimientos',
            flowStep: 'Clonar movimiento desde el listado',
            userMessage: 'No se pudo clonar el movimiento desde el listado.',
            technicalDetail: 'Falla al abrir acciones, seleccionar clonar o confirmar el clonado.',
        },
        editarMovimiento: {
            module: 'Logistica',
            screen: 'Registro de movimiento',
            flowStep: 'Editar cantidad del movimiento',
            userMessage: 'No se pudo actualizar la cantidad del movimiento.',
            technicalDetail: 'Falla al abrir edición o guardar la actualización.',
        },
        accionesImpresion: {
            module: 'Logistica',
            screen: 'Listado de movimientos',
            flowStep: 'Abrir acciones de impresión, descarga y envío',
            userMessage: 'No se pudo abrir el panel de impresión, descarga y envío.',
            technicalDetail: 'Falla al abrir menú de acciones o seleccionar opciones adicionales.',
        },
        cargaMasiva: {
            module: 'Logistica',
            screen: 'Movimientos masivos',
            flowStep: 'Cargar movimientos desde excel',
            userMessage: 'No se pudo completar la carga masiva de movimientos desde excel.',
            technicalDetail: 'Falla al subir archivo, avanzar en el asistente o procesar la carga.',
        },
    },
    stock: {
        buscarProducto: {
            module: 'Logistica',
            screen: 'Stock de productos',
            flowStep: 'Verificar stock actualizado en inventario',
            userMessage: 'No se pudo completar la búsqueda del producto en la pantalla de stock.',
            technicalDetail: 'Timeout o falla de interacción en el campo de búsqueda de stock.',
        },
        abrirKardex: {
            module: 'Logistica',
            screen: 'Stock de productos',
            flowStep: 'Abrir kardex desde la vista de stock',
            userMessage: 'La pantalla de stock no permitió abrir el kardex del producto.',
            technicalDetail: 'Falla al abrir popup de kardex o en su carga inicial.',
        },
    },
    kardex: {
        buscarProducto: {
            module: 'Logistica',
            screen: 'Kardex total',
            flowStep: 'Buscar producto en kardex',
            userMessage: 'No se pudo completar la búsqueda del producto en la vista de kardex.',
            technicalDetail: 'Falla al interactuar con el buscador de kardex.',
        },
        abrirKardexProducto: {
            module: 'Logistica',
            screen: 'Kardex total',
            flowStep: 'Abrir detalle de kardex por producto',
            userMessage: 'No se pudo abrir el detalle del kardex por producto.',
            technicalDetail: 'El botón de kardex por producto no respondió o la vista no cargó correctamente.',
        },
        abrirDetalleAlmacen: {
            module: 'Logistica',
            screen: 'Kardex total',
            flowStep: 'Abrir ver detalle por almacén',
            userMessage: 'No se pudo abrir el detalle del almacén en la pantalla de kardex.',
            technicalDetail: 'No se encontró el almacén objetivo o el botón Ver detalle no estuvo disponible.',
        },
    },
    puntoVenta: {
        navegarAPdV: {
            module: 'PuntoVenta',
            screen: 'Punto de Venta',
            flowStep: 'Navegar al módulo de Punto de Venta',
            userMessage: 'No se pudo abrir el módulo de Punto de Venta.',
            technicalDetail: 'Falla en la navegación desde el menú hacia Punto de Venta.',
        },
        abrirCaja: {
            module: 'PuntoVenta',
            screen: 'Apertura de Caja',
            flowStep: 'Abrir caja de venta',
            userMessage: 'No se pudo aperturar la caja de venta.',
            technicalDetail: 'Falla al detectar estado de caja o confirmar apertura.',
        },
        seleccionarComprobante: {
            module: 'PuntoVenta',
            screen: 'Emisión > Tipo de Comprobante',
            flowStep: 'Seleccionar tipo de comprobante',
            userMessage: 'No se pudo seleccionar el tipo de comprobante para la emisión.',
            technicalDetail: 'Falla al interactuar con el selector de tipo de comprobante.',
        },
        agregarItem: {
            module: 'PuntoVenta',
            screen: 'Emisión > Detalle',
            flowStep: 'Agregar ítem a la venta',
            userMessage: 'No se pudo agregar el ítem al detalle de la venta.',
            technicalDetail: 'Falla en búsqueda o selección de ítem en la grilla de venta.',
        },
        emitirComprobante: {
            module: 'PuntoVenta',
            screen: 'Emisión > Pago',
            flowStep: 'Emitir comprobante con pago',
            userMessage: 'No se pudo completar la emisión del comprobante.',
            technicalDetail: 'Falla al confirmar pago o emitir comprobante.',
        },
        validarSunat: {
            module: 'PuntoVenta',
            screen: 'Estado SUNAT',
            flowStep: 'Validar estado SUNAT del comprobante',
            userMessage: 'El comprobante no alcanzó un estado SUNAT válido.',
            technicalDetail: 'Timeout o estado inesperado en la consulta de SUNAT.',
        },
    },
} as const satisfies Record<string, Record<string, FunctionalPreset>>;
