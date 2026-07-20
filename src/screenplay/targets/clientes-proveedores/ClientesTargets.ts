import type {Page} from '@playwright/test';

/**
 * Locators estables para el submódulo Clientes (CRM).
 * IDs reales extraídos del Codegen.
 */
export const ClientesTargets = {
    // ─── Formulario ─────────────────────────────────────────────
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

    // ─── Campo adicional ────────────────────────────────────────
    btnNuevoCampoAdicional: (page: Page) =>
        page.getByText('Nuevo campo adicional'),

    tipoCampoTexto: (page: Page) =>
        page.getByText('Campo de texto'),

    inputNombreCampo: (page: Page) =>
        page.getByRole('textbox', {name: 'Digitar nombre'}),

    inputValorCampo: (page: Page) =>
        page.locator('[id="pv_clientes_campo-adicional-generico:form_campos:v-input:valor-por-defecto"]'),

    btnCrearCampo: (page: Page) =>
        page.getByRole('button', {name: 'Crear campo'}),

    inputCampoAdicionalCreado: (page: Page) =>
        page.locator('[id^="pv_clientes_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]'),

    // ─── Listado / Búsqueda ─────────────────────────────────────
    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: /Buscar por nombre, N/}),

    tbody: (page: Page) =>
        page.locator('tbody'),

    celdaSinResultados: (page: Page) =>
        page.getByRole('cell').getByText('NO HAY RESULTADOS'),

    // ─── Menú contextual en tabla ──────────────────────────────
    botonContextual: (page: Page) =>
        page.locator('[id^="pv_clientes_cmp-lista-clientes-body-options:cmp-dropdown:opciones-clientes:cliente-"]'),

    // ─── Filtros avanzados ──────────────────────────────────────
    btnVerFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),

    // ─── Mensajes ───────────────────────────────────────────────
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

    // ─── Detalle del cliente ────────────────────────────────────
    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    // ─── Notas adicionales ──────────────────────────────────────
    btnNuevaNota: (page: Page) =>
        page.getByRole('button', {name: 'Nueva nota adicional'}),

    inputTituloNota: (page: Page) =>
        page.locator('[id="pv_clientes_notas-adicionales-cliente:v-input:titulo-nota"]'),

    textareaMensajeNota: (page: Page) =>
        page.locator('[id="pv_clientes_notas-adicionales-cliente:v-textarea:mensaje-nota"]'),

    btnGuardarNota: (page: Page) =>
        page.locator('.icon.check'),

    // ─── Bitácora ───────────────────────────────────────────────
    pestaniaBitacora: (page: Page, texto: string) =>
        page.getByText(texto, {exact: true}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close > .icon'),

    // ─── Slider Activar/Desactivar ──────────────────────────────
    sliderEstado: (page: Page) =>
        page.locator('.slider'),

    // ─── Selector Activo/Inactivo en formulario ────────────────────
    estadoActivo: (page: Page) =>
        page.getByText('Activo', {exact: true}),

    estadoInactivo: (page: Page) =>
        page.getByText('Inactivo'),

    // ─── Modal de confirmación ──────────────────────────────────
    btnConfirmarEliminar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    btnConfirmarCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Sí, cancelar'}),

    btnCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    btnAceptarError: (page: Page) =>
        page.getByRole('button', {name: 'Aceptar'}),

    // ─── Filtros avanzados detallados ───────────────────────────
    filtroTipoDocumento: (page: Page) =>
        page.locator('div').filter({hasText: /^Tipo documento$/}).nth(2),

    filtroTipoDocEnTabla: (page: Page, tipo: string) =>
        page.locator('thead').getByText(tipo),

    inputFiltroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: 'N° de documento', exact: true}),

    inputFiltroCodigo: (page: Page) =>
        page.getByRole('textbox', {name: 'Cod cliente'}),

    inputFiltroTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Teléfono', exact: true}),

    // ─── Notas adicionales - menú contextual ────────────────────
    botonContextualNota: (page: Page) =>
        page.locator('[id=\"pv_clientes_notas-adicionales_cliente_item:cmp-dropdown:opciones\"]').first(),

    opcionEliminarNota: (page: Page) =>
        page.getByText('Eliminar nota adicional').first(),

    btnConfirmarSi: (page: Page) =>
        page.getByRole('button', {name: 'Sí'}),

    seccionNotasAdicionales: (page: Page) =>
        page.getByText('Notas adicionales'),

    // ─── Botón cerrar drape alternativo ─────────────────────────
    btnCerrarDrapeAlt: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),

    // ─── Configuración de Columnas ──────────────────────────────
    btnAñadirCampos: (page: Page) =>
        page.locator('.v-icon-head-plus > .icon').first(),

    etiquetaCampoObligatorio: (page: Page, nombreCampo: string) =>
        page.locator('.item', { hasText: nombreCampo }).locator('.v-psmall', { hasText: 'Obligatorio' }),

    checkboxColumna: (page: Page, nombreCampo: string) =>
        page.locator('.item', { hasText: nombreCampo }).locator('.v-checkbox-grid-label > span'),

    thead: (page: Page) =>
        page.locator('thead'),

    // ─── Menú Opciones (Descarga / Carga Masiva) ────────────────
    btnOpcionesGenerales: (page: Page) =>
        page.locator('.icon-container > .icon'),

    opcionDescargarFiltrados: (page: Page) =>
        page.getByText('Descargar clientes filtrados'),

    opcionDescargarTodos: (page: Page) =>
        page.getByText('Descargar todos los clientes'),

    opcionCrearDesdeExcel: (page: Page) =>
        page.getByText('Crear clientes desde excel'),

    // ─── Flujo de Carga Masiva ──────────────────────────────────
    btnSiguiente: (page: Page) =>
        page.getByText('Siguiente'),

    btnSeleccionarArchivo: (page: Page) =>
        page.getByRole('button', { name: 'Seleccionar archivo' }),

    btnProcesarExcel: (page: Page) =>
        page.getByText('Procesar', { exact: true }),

    mensajeExitoMasivo: (page: Page) =>
        page.getByText('¡Clientes procesados correctamente!'),

    mensajeErrorMasivo: (page: Page) =>
        page.getByText('Archivo con errores'),

    btnIrAlInicio: (page: Page) =>
        page.getByRole('button', { name: 'Ir al inicio' }),

    // ─── Acciones Masivas (Eliminación) ─────────────────────────
    checkboxSeleccionarTodo: (page: Page) =>
        page.locator('.v-checkbox-default-label > span').first(),

    btnAccionesMasivas: (page: Page) =>
        page.getByText('Acciones masivas'),

    opcionEliminarClientesMasivo: (page: Page) =>
        page.getByText('ELIMINAR CLIENTES', { exact: true }),

    mensajeExitoEliminacionMasiva: (page: Page) =>
        page.locator('body').getByText('Los clientes fueron eliminados exitosamente'),
};
