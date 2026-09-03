import {type Page} from '@playwright/test';

export const VendedoresTargets = {

    btnCrearVendedor: (page: Page) =>
        page.locator('[idx="pv_cmp-header-relacionado-entidad_opciones_add_relacionado_vendedor:button"]'),

    inputBuscar: (page: Page) =>
        page.locator('[id="pv_vendedores_cmp-lista-proveedores-filtro:filters_v-input:busqueda-compuesta"]'),

    tbody: (page: Page) =>
        page.locator('tbody'),

    sinResultados: (page: Page) =>
        page.getByText('NO HAY RESULTADOS PARA TU BÚSQUEDA'),

    thead: (page: Page) =>
        page.locator('thead'),

    btnFiltrosAvanzados: (page: Page) =>
        page.locator('[id="pv_vendedores_cmp-lista-proveedores-filtro:filters_v-button:button-activar-filtro"]'),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),


    opcionesFilaPorVendedor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    opcionEditarVendedor: (page: Page) =>
        page.locator('[id$="cmp-dropdown:options-li:edicion-vendedor"]'),

    opcionVerBitacora: (page: Page) =>
        page.locator('[id$="cmp-dropdown:options-li:ver-bitacora"]'),

    opcionDesactivarVendedor: (page: Page) =>
        page.locator('[id="pv_vendedores_cmp-grid-options:opciones_vendedor_cmp-dropdown:options-li:desactivar-vendedor"]').getByText('Desactivar vendedor'),

    opcionActivarVendedor: (page: Page) =>
        page.locator('[id="pv_vendedores_cmp-grid-options:opciones_vendedor_cmp-dropdown:options-li:desactivar-vendedor"]').getByText('Activar vendedor'),


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


    inputMetaMonto: (page: Page) =>
        page.locator('[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-monto"]'),

    inputMetaCantidad: (page: Page) =>
        page.locator('[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-cantidad"]'),

    inputZonaVentas: (page: Page) =>

        page.locator('[id="pv_proveedores_form-registro-relacionado-campo-multiple:form_campos:v-input:ZonasVenta-0"]'),

    inputDireccion: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-campo-multiple:form_campos:v-input:Direcciones-0"]'),

    inputTelefono: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-campo-multiple:form_campos:v-input:Telefonos-0"]'),

    inputEmail: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:email"]'),


    btnCrearVendedorForm: (page: Page) =>
        page.locator('[id="pv_proveedores_registro-proveedor:draper_v_button:registrar-proveedor"]'),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnCancelarForm: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    sliderEstado: (page: Page) =>
        page.locator('.slider'),


    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page) =>
        page.getByText('Tu nuevo vendedor fue agregado exitosamente'),

    mensajeExitoEdicion: (page: Page) =>
        page.getByText('Los cambios se guardaron exitosamente'),

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


    opcionEliminarVendedor: (page: Page) =>
        page.locator('.icon.eliminacion-vendedor'),

    btnConfirmarEliminarVendedor: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    botonContextualVendedor: (page: Page) =>
        page.locator('[id^="pv_vendedores_cmp-lista-proveedores-body-options:cmp-dropdown:opciones-proveedores:vendedor-"]:not(.opcion-item)'),
};
