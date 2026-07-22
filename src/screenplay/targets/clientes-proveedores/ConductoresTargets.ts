import {type Page} from '@playwright/test';

export const ConductoresTargets = {

    btnCrearConductor: (page: Page) =>
        page.getByText('Crear conductor', {exact: true}),

    inputBuscar: (page: Page) =>
        page.locator('[id="pv_conductores_cmp-lista-conductores-filtro:filters_v-input:busqueda-compuesta"]'),

    tbody: (page: Page) =>
        page.locator('tbody'),

    thead: (page: Page) =>
        page.locator('thead'),

    btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),


    botonContextualConductor: (page: Page) =>
        page.locator('[id^="pv_conductores_cmp-lista-conductores-body-options:cmp-dropdown:opciones-conductores:conductor-"]'),

    opcionesFilaPorConductor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    
    menuOpciones: (page: Page) =>
        page.locator('ul.opciones-container'),

    opcionEditarConductor: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:edicion-conductor"]'),

    opcionVerBitacora: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:ver-bitacora"]'),

    opcionVerGuias: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:ver-ventas"]'),

    opcionVerNotas: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:notas-conductor"]'),

    opcionEliminarConductor: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:eliminar-conductor"]'),

    opcionDesactivarConductor: (page: Page) =>
        page.locator('li[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:desactivar-conductor"]'),

    opcionActivarConductor: (page: Page) =>
        page.getByRole('listitem').filter({hasText: 'Activar conductor'}),

    switchDesactivarConductor: (page: Page) =>
        page.locator('[id="pv_conductores_cmp-grid-options:opciones_conductor_cmp-dropdown:options-li:desactivar-conductor"] input[type="checkbox"]'),


    
    selectTipoDocumento: (page: Page) =>
        page.locator('id=pv_conductores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento').first(),

    
    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.locator('.v-select-form-option', {hasText: tipo}).first(),

    inputNumeroDocumento: (page: Page) =>
        page.locator('id=pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document').first(),

    inputRazonSocial: (page: Page) =>
        page.locator('id=pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:razon-social').first(),

    selectModoCodigo: (page: Page) =>
        page.locator('[id="_div\\:dropdown"]').filter({hasText: /Automático|Manual/}),

    opcionCodigoManual: (page: Page) =>
        page.getByText('Manual', {exact: true}),

    inputCodigoManual: (page: Page) =>
        page.locator('id=pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:codigo').first(),


    selectTipoLicencia: (page: Page) =>
        page.locator('.v-select-header-form').filter({hasText: 'Seleccionar'}).first(),

    opcionTipoLicencia: (page: Page, categoria: string) =>
        page.locator('.v-select-form-option', {hasText: new RegExp(`^${categoria}$`)}).first(),

    inputNumeroLicencia: (page: Page) =>
        page.locator('id=pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:licencia').first(),

    inputZonaTransporte: (page: Page) =>
        page.locator('id=pv_conductores_form-registro-relacionado-campo-multiple:form_campos:v-input:ZonasTransporte-0').first(),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'}),

    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. 954588556'}),

    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. usuario@correo.com|srqa/}),


    btnCrearConductorForm: (page: Page) =>
        page.locator('[id="pv_conductores_registro-conductor:draper_v_button:registrar-conductor"]').first(),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnCancelarForm: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    sliderEstado: (page: Page) =>
        page.locator('.slider'),


    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page) =>
        page.getByText('Tu nuevo conductor fue', {exact: false}),

    mensajeExitoEdicion: (page: Page) =>
        page.getByText('Los cambios se guardaron exitosamente'),

    mensajeExitoEliminacion: (page: Page) =>
        page.getByText('El conductor fue eliminado exitosamente'),

    btnConfirmarEliminar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body'),

    mensajeDigitos: (page: Page) =>
        page.locator('body'),


    pestaniaBitacora: (page: Page, pestania: string) =>
        page.getByText(pestania, {exact: true}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),
};
