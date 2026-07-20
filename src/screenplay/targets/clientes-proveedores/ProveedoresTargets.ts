import {type Page} from '@playwright/test';

export const ProveedoresTargets = {

    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    btnCrearProveedor: (page: Page) =>
        page.locator('div').filter({hasText: /^Crear proveedor$/}),

    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: 'Buscar por nombre, N° de'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),


    inputFiltroRazonSocial: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-lista-proveedores-grid-header:headers_proveedores_row:v-input:RazonSocial"]'),

    inputFiltroDocumento: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-lista-proveedores-grid-header:headers_proveedores_row:v-input:Documento"]'),

    inputFiltroCodigo: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-lista-proveedores-grid-header:headers_proveedores_row:v-input:Codigo"]'),

    inputFiltroTelefono: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-lista-proveedores-grid-header:headers_proveedores_row:v-input:Telefonos"]'),

    tbody: (page: Page) =>
        page.locator('tbody'),

    thead: (page: Page) =>
        page.locator('thead'),

    btnFiltrosAvanzados: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-lista-proveedores-filtro:filters_v-button:button-activar-filtro"]'),

    filtroTipoDocumento: (page: Page) =>
        page.locator('.v-multiselect-small[id="pv_proveedores_cmp-lista-proveedores-grid-header:headers_proveedores_row:v-multiselect:TipoDocumento"]'),

    opcionFiltroTipoDoc: (page: Page, tipo: string) =>
        page.locator('.v-multiselect-base-options').getByText(tipo),

    botonContextualPorProveedor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    opcionEditarProveedor: (page: Page) =>
        page.getByText('Editar proveedor'),

    opcionVerBitacora: (page: Page) =>
        page.getByText('Ver bitácora'),

    opcionDesactivarProveedor: (page: Page) =>
        page.getByText('Desactivar proveedor'),

    opcionActivarProveedor: (page: Page) =>
        page.getByText('Activar proveedor'),

    botonContextualProveedor: (page: Page) =>
        page.locator('[id^="pv_proveedores_cmp-lista-proveedores-body-options:cmp-dropdown:opciones-proveedores:proveedor-"]'),

    opcionEliminarProveedor: (page: Page) =>
        page.locator('[id="pv_proveedores_cmp-grid-options:opciones_proveedor_cmp-dropdown:options-li:eliminar-proveedor"]'),

    btnConfirmarEliminarProveedor: (page: Page) =>
        page.locator('div[id="pv_proveedores_v-modal:confirmacion-eliminacion-movimiento_v-button:aceptar-eliminacion"]'),


    selectTipoDocumento: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"].v-select-header-form'),

    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"] .v-select-form-option').getByText(tipo),

    inputNumeroDocumento: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]'),

    inputRazonSocial: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:razon-social"]'),

    selectModoCodigo: (page: Page) =>
        page.locator('[id="_div:dropdown"]').filter({hasText: /Automático|Manual/}),

    opcionCodigoManual: (page: Page) =>
        page.getByText('Manual', {exact: true}),

    inputCodigoManual: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:codigo"]'),

    inputDireccion: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-campo-multiple:form_campos:v-input:Direcciones-0"]'),

    inputTelefono: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-campo-multiple:form_campos:v-input:Telefonos-0"]'),

    inputEmail: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:email"]'),


    btnCrearProveedorForm: (page: Page) =>
        page.locator('[id="pv_proveedores_registro-proveedor:draper_v_button:registrar-proveedor"]'),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnCancelarForm: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    btnConfirmarCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Sí, cancelar'}),

    btnEliminarConfirmar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    switchEstado: (page: Page) =>
        page.locator('.opcion-item .v-switch label.switch'),

    selectEstadoEnFormulario: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-select:estado"]'),

    opcionEstadoFormulario: (page: Page, estado: string) =>
        page.getByText(estado, {exact: true}).nth(1),

    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page) =>
        page.getByText('Tu nuevo proveedor fue agregado exitosamente'),

    mensajeExitoEdicion: (page: Page) =>
        page.getByText('Los cambios se guardaron exitosamente'),

    mensajeExitoEliminacion: (page: Page) =>
        page.getByText('El proveedor fue eliminado exitosamente'),

    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body'),

    pestaniaBitacora: (page: Page, pestania: string) =>
        page.getByText(pestania, {exact: true}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),

    btnOpcionesGenerales: (page: Page) =>
        page.locator('.icon-container > .icon').first(),

    opcionDescargarFiltrados: (page: Page) =>
        page.getByText('Descargar proveedores filtrados', {exact: false}).or(page.getByText('Descargar proveedores')),

    opcionDescargarTodos: (page: Page) =>
        page.getByText('Descargar todos los proveedores', {exact: false}).or(page.getByText('Descargar todos los')),
};
