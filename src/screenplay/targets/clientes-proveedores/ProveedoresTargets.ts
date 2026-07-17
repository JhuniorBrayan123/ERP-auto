import type {Page} from '@playwright/test';
import {EntidadesTargets as E, type TipoEntidad} from './EntidadesTargets';

/**
 * Targets específicos del submódulo Proveedores dentro de "Clientes y proveedores".
 * Sigue el mismo patrón que ClientesTargets pero con IDs pv_proveedores_*.
 */
export const ProveedoresTargets = {
    // ─── Formulario ──────────────────────────────────────────────
    selectTipoDocumento: (page: Page) =>
        page.locator('[id$="v-select:tipo-documento"] > .text'),

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
        page.locator('[id$="v-input:codigo"]'),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. Calle Los Manzanos/}),

    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. 987 654/}),

    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. usuario@correo\.com/}),

    // ─── Botones ─────────────────────────────────────────────────
    btnCrearProveedor: (page: Page) =>
        page.locator('div').filter({hasText: /^Crear proveedor$/}),

    btnGuardarProveedor: (page: Page) =>
        page.getByRole('button', {name: 'Crear proveedor'}),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    // ─── Campos adicionales ──────────────────────────────────────
    btnNuevoCampoAdicional: (page: Page) =>
        page.locator('[id^="pv_proveedores_form-registro-relacionado-campo-adicional:btn-nuevo-campo"]'),

    tipoCampoTexto: (page: Page) =>
        page.locator('[id^="pv_proveedores_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]'),

    inputNombreCampo: (page: Page) =>
        page.locator('[id^="pv_proveedores_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]').first(),

    inputValorCampo: (page: Page) =>
        page.locator('[id^="pv_proveedores_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]').nth(1),

    btnCrearCampo: (page: Page) =>
        page.getByRole('button', {name: 'Crear campo'}),

    inputCampoAdicionalCreado: (page: Page) =>
        page.locator('[id^="pv_proveedores_form-registro-relacionado-campo-adicional:form_campos:v-input:campo-texto"]'),

    // ─── Listado / Búsqueda ─────────────────────────────────────
    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: /Buscar por nombre, N/}),

    tbody: (page: Page) =>
        page.locator('tbody'),

    celdaSinResultados: (page: Page) =>
        page.getByRole('cell').getByText('NO HAY RESULTADOS'),

    // ─── Menú contextual en tabla ──────────────────────────────
    botonContextual: (page: Page) =>
        page.locator('[id^="pv_proveedores_cmp-lista-proveedores-body-options:cmp-dropdown:opciones-proveedores:proveedor-"]'),

    // ─── Filtros avanzados ──────────────────────────────────────
    btnVerFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),

    // ─── Mensajes ───────────────────────────────────────────────
    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page) =>
        page.locator('body').getByText('Tu nuevo proveedor fue agregado exitosamente'),

    mensajeExitoEdicion: (page: Page) =>
        page.locator('body').getByText('Los cambios se guardaron exitosamente'),

    mensajeExitoEliminacion: (page: Page) =>
        page.locator('body').getByText('El proveedor fue eliminado exitosamente'),

    mensajeErrorDuplicado: (page: Page) =>
        page.locator('body').getByText(/ya esta registrado/),

    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body').getByText('Campo obligatorio'),

    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    // ─── Detalle ────────────────────────────────────────────────
    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    // ─── Notas adicionales ──────────────────────────────────────
    btnNuevaNota: (page: Page) =>
        page.getByRole('button', {name: 'Nueva nota adicional'}),

    inputTituloNota: (page: Page) =>
        page.locator('[id="pv_proveedores_notas-adicionales-proveedor:v-input:titulo-nota"]'),

    textareaMensajeNota: (page: Page) =>
        page.locator('[id="pv_proveedores_notas-adicionales-proveedor:v-textarea:mensaje-nota"]'),

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

    // ─── Selector Activo/Inactivo en formulario ─────────────────
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
};

export type ProveedoresTargetsType = typeof ProveedoresTargets;
