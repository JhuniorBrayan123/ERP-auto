import type {Page} from '@playwright/test';

export const ClientesTargets = {
    
    selectTipoDocumento: (page: Page) =>
        page.locator('[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"] > .text'),

    opcionDocumentoEnDropdown: (page: Page, texto: string) =>
        page.locator('.v-select-base-options.is-open').getByText(texto, {exact: true}),

    inputNumeroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. (12345678|20123456789)/}),

    inputNombreRazonSocial: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}),

    toggleTipoCodigo: (page: Page) =>
        page.locator('[id="_div:dropdown"]'),

    opcionManual: (page: Page) =>
        page.getByText('Manual'),

    inputCodigo: (page: Page) =>
        page.locator('[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:codigo"]'),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. Calle Los Manzanos/}),

    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. 987 654/}),

    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. usuario@correo\.com/}),

    btnCrearCliente: (page: Page) =>
        page.getByText('Crear cliente', {exact: true}),

    btnGuardarCliente: (page: Page) =>
        page.getByRole('button', {name: 'Crear cliente'}),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    
    btnNuevoCampoAdicional: (page: Page) =>
        page.getByText('Nuevo campo adicional'),

    tipoCampoTexto: (page: Page) =>
        page.getByText('Campo de texto'),

    inputNombreCampo: (page: Page) =>
        page.locator('[id="pv_clientes_campo-adicional-generico:form_campos:v-input:nombre-campo"]'),

    inputValorCampo: (page: Page) =>
        page.locator('[id="pv_clientes_campo-adicional-generico:form_campos:v-input:valor-por-defecto"]'),

    btnCrearCampo: (page: Page) =>
        page.getByRole('button', {name: 'Crear campo'}),

    inputCampoAdicionalCreado: (page: Page, nombreCampo: string) =>
        page.locator('.campo')
            .filter({hasText: nombreCampo})
            .locator('input[id^="pv_clientes_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]'),

    btnEliminarCampoAdicional: (page: Page, nombreCampo: string) =>
        page.locator('.campo')
            .filter({hasText: nombreCampo})
            .locator('.v-icon-delete'),

    btnConfirmarEliminarCampo: (page: Page) =>
        page.locator('[id^="pv_clientes_form-registro-relacionado-campo-adicional:form_campos:v-button:eliminar-"]'),

    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: /Buscar por nombre, N/}),

    tbody: (page: Page) =>
        page.locator('tbody'),

    celdaSinResultados: (page: Page) =>
        page.getByRole('cell').getByText('NO HAY RESULTADOS'),

    botonContextual: (page: Page) =>
        page.locator('[id^="pv_clientes_cmp-lista-clientes-body-options:cmp-dropdown:opciones-clientes:cliente-"]'),

    opcionVerCliente: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:visualizacion-cliente"]'),

    opcionEditarCliente: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:edicion-cliente"]'),

    opcionVerBitacora: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:ver-bitacora"]'),

    opcionVerVentas: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:ver-ventas"]'),

    opcionVerNotas: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:notas-cliente"]'),

    opcionEliminarCliente: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:eliminar-cliente"]'),

    opcionToggleEstado: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-grid-options:opciones_cliente_cmp-dropdown:options-li:desactivar-cliente"]'),

    btnVerFiltros: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-filtro:filters_v-button:button-activar-filtro"]'),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),

    
    inputFiltroRazonSocial: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-grid-header:headers_clientes_row:v-input:RazonSocial"]'),

    inputFiltroDocumento: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-grid-header:headers_clientes_row:v-input:Documento"]'),

    inputFiltroTelefono: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-grid-header:headers_clientes_row:v-input:Telefonos"]'),

    
    multiselectFiltroTipoDoc: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-grid-header:headers_clientes_row:v-multiselect:TipoDocumento"]'),

    opcionFiltroTipoDoc: (page: Page, tipo: string) =>
        page.locator('.v-multiselect-base-options').getByText(tipo, {exact: true}),

    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page) =>
        page.locator('body').getByText('Tu nuevo cliente fue agregado exitosamente'),

    mensajeExitoEdicion: (page: Page) =>
        page.locator('body').getByText('Los cambios se guardaron exitosamente'),

    mensajeExitoEliminacion: (page: Page) =>
        page.locator('body').getByText('El cliente fue eliminado exitosamente'),

    mensajeErrorDuplicado: (page: Page) =>
        page.locator('body').getByText(/ya esta registrado/),

    mensajeErrorVentasAsociadas: (page: Page) =>
        page.locator('body').getByText('No puedes eliminar este cliente'),

    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body').getByText('Campo obligatorio'),

    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    btnCerrarPopup: (page: Page) =>
        page.locator('.popup-container > .button-close > .icon'),

    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    btnNuevaNota: (page: Page) =>
        page.getByRole('button', {name: 'Nueva nota adicional'}),

    inputTituloNota: (page: Page) =>
        page.locator('[id="pv_clientes_notas-adicionales-cliente:v-input:titulo-nota"]'),

    textareaMensajeNota: (page: Page) =>
        page.locator('[id="pv_clientes_notas-adicionales-cliente:v-textarea:mensaje-nota"]'),

    btnGuardarNota: (page: Page) =>
        page.locator('.icon.check'),

    pestaniaBitacora: (page: Page, texto: string) =>
        page.getByText(texto, {exact: true}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close > .icon'),

    sliderEstado: (page: Page) =>
        page.locator('.slider'),

    estadoSelect: (page: Page) =>
        page.locator('[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-select:estado"].v-select-header-form'),

    estadoActivo: (page: Page) =>
        page.locator('.v-select-base-options.is-open').getByText('Activo', {exact: true}),

    estadoInactivo: (page: Page) =>
        page.locator('.v-select-base-options.is-open').getByText('Inactivo', {exact: true}),

    btnConfirmarEliminar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    btnConfirmarCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Sí, cancelar'}),

    btnCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    btnAceptarError: (page: Page) =>
        page.getByRole('button', {name: 'Aceptar'}),

    
    inputFiltroCodigo: (page: Page) =>
        page.getByRole('textbox', {name: 'Cod cliente'}),

    botonContextualNota: (page: Page) =>
        page.locator('[id=\"pv_clientes_notas-adicionales_cliente_item:cmp-dropdown:opciones\"]').first(),

    opcionEliminarNota: (page: Page) =>
        page.getByText('Eliminar nota adicional').first(),

    btnConfirmarSi: (page: Page) =>
        page.getByRole('button', {name: 'Sí'}),

    seccionNotasAdicionales: (page: Page) =>
        page.getByText('Notas adicionales', {exact: true}),

    
    btnCerrarDrapeAlt: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),

    
    btnAñadirCampos: (page: Page) =>
        page.locator('.v-icon-head-plus > .icon').first(),

    etiquetaCampoObligatorio: (page: Page, nombreCampo: string) =>
        page.locator('.item', {hasText: nombreCampo}).locator('.v-psmall', {hasText: 'Obligatorio'}),

    checkboxColumna: (page: Page, nombreCampo: string) =>
        page.locator('.item', {hasText: nombreCampo}).locator('.v-checkbox-grid-label > span'),

    thead: (page: Page) =>
        page.locator('thead'),

    
    btnOpcionesGenerales: (page: Page) =>
        page.locator('.icon-container > .icon'),

    opcionDescargarFiltrados: (page: Page) =>
        page.getByText('Descargar clientes filtrados'),

    opcionDescargarTodos: (page: Page) =>
        page.getByText('Descargar todos los clientes'),

    opcionCrearDesdeExcel: (page: Page) =>
        page.getByText('Crear clientes desde excel'),

    
    btnSiguiente: (page: Page) =>
        page.getByText('Siguiente'),

    btnSeleccionarArchivo: (page: Page) =>
        page.locator('input[type="file"]'),

    btnProcesarExcel: (page: Page) =>
        page.getByText('Procesar', {exact: true}),

    mensajeExitoMasivo: (page: Page) =>
        page.getByText('¡Clientes procesados correctamente!'),

    mensajeErrorMasivo: (page: Page) =>
        page.getByText('Archivo con errores'),

    btnIrAlInicio: (page: Page) =>
        page.getByRole('button', {name: 'Ir al inicio'}),

    
    checkboxSeleccionarTodo: (page: Page) =>
        page.locator('[id="pv_clientes_cmp-lista-clientes-grid-header:headers_clientes_row:v-checkbox:select-all"]'),

    btnAccionesMasivas: (page: Page) =>
        page.locator('[id="pv_common_cmp-header-relacionado-entidad.cmp-option-button:opciones-masivas"]'),

    opcionEliminarClientesMasivo: (page: Page) =>
        page.locator('[id="pv_common_cmp-header-relacionado-entidad.cmp-option-button.li:eliminar-masivo"]'),

    mensajeExitoEliminacionMasiva: (page: Page) =>
        page.locator('body').getByText('Los clientes fueron eliminados exitosamente'),
};
