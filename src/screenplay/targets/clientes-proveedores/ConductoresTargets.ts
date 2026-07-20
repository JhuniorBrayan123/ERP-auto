import {type Page} from '@playwright/test';

export const ConductoresTargets = {
    // ─── Listado Principal ──────────────────────
    btnCrearConductor: (page: Page) =>
        page.getByText('Crear conductor', { exact: true }),
    
    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: 'Buscar por nombre, N° de'}),
    
    tbody: (page: Page) =>
        page.locator('tbody'),
    
    thead: (page: Page) =>
        page.locator('thead'),

    btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),

    // ─── Botón Contextual (3 puntos) en la tabla ───────────────
    opcionesFilaPorConductor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    opcionEditarConductor: (page: Page) =>
        page.locator('[id$="cmp-dropdown:opciones-conductores:edicion-conductor"]').or(page.getByText('Editar conductor')),

    opcionVerBitacora: (page: Page) =>
        page.getByText('Ver bitácora').or(page.getByText('Visualiza el historial de tu')),

    opcionDesactivarConductor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Desactivar conductor' }).or(page.getByText('Desactivar conductor')),
        
    opcionActivarConductor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Activar conductor' }).or(page.getByText('Activar conductor')),

    opcionVerGuias: (page: Page) =>
        page.getByText('Ver guias a conductor'),

    // ─── Formulario de Creación / Edición ──────────────────────
    selectTipoDocumento: (page: Page) =>
        page.locator('[id$="form_basico:v-select:tipo-documento"] > .text'),
    
    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.getByText(tipo).nth(2).or(page.getByText(tipo).first()), // En el codegen a veces usa nth(2) para DNI
        
    inputNumeroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. \d+|AB\d+/}),
        
    inputRazonSocial: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}),
        
    selectModoCodigo: (page: Page) =>
        page.locator('[id="_div:dropdown"]').filter({hasText: /Automático|Manual/}),

    opcionCodigoManual: (page: Page) =>
        page.getByText('Manual', {exact: true}),
        
    inputCodigoManual: (page: Page) =>
        page.locator('[id$="form_basico:v-input:codigo"]'),

    // Campos específicos de conductor
    selectTipoLicencia: (page: Page) =>
        page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(3).or(page.locator('[id$="form_basico:v-select:tipo-licencia"] > .text')),

    opcionTipoLicencia: (page: Page, categoria: string) =>
        page.locator('div').filter({ hasText: new RegExp(`^${categoria}$`) }).nth(3).or(page.getByText(categoria).nth(1)).or(page.getByText(categoria).first()),

    inputNumeroLicencia: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. AB12CD34EF'}),

    inputZonaTransporte: (page: Page) =>
        page.locator('[id$="form_basico:v-input:zona-transporte"]').or(page.getByRole('textbox', {name: 'Lima sur'})),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'}),
        
    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. 954588556'}),
        
    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. usuario@correo.com|srqa/}),

    // ─── Botones de Acción (Formulario) ────────────────────────
    btnCrearConductorForm: (page: Page) =>
        page.getByRole('button', {name: 'Crear conductor'}),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnCancelarForm: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    sliderEstado: (page: Page) =>
        page.locator('.slider'),

    // ─── Modales y Mensajes (Toasts) ───────────────────────────
    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),
        
    mensajeExitoCreacion: (page: Page) =>
        page.getByText('Tu nuevo conductor fue', {exact: false}),
        
    mensajeExitoEdicion: (page: Page) =>
        page.getByText('Los cambios se guardaron exitosamente'),
        
    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),
        
    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body'), // El texto "Campo obligatorio"

    mensajeDigitos: (page: Page) =>
        page.locator('body'), // "Debe ingresar 11 dígitos"

    // ─── Bitácora y Paneles Drape ──────────────────────────────
    pestaniaBitacora: (page: Page, pestania: string) =>
        page.getByText(pestania, {exact: true}),
        
    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),
};
