import {type Page} from '@playwright/test';

export const VendedoresTargets = {
    // ─── Listado Principal ──────────────────────
    btnCrearVendedor: (page: Page) =>
        page.getByText('Crear vendedor', { exact: true }),
    
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
    // Captura el botón contextual basado en un regex dinámico o buscando la fila.
    opcionesFilaPorVendedor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    opcionEditarVendedor: (page: Page) =>
        // Según codegen, podría ser un click directo si tiene un id específico, 
        // pero usaremos el text o nth como en el codegen si fuera un dropdown.
        // El codegen usa: locator('[id="pv_vendedores_cmp-grid-options:opciones_vendedor_cmp-dropdown:options-li:edicion-vendedor"]')
        page.locator('[id$="cmp-dropdown:options-li:edicion-vendedor"]').or(page.getByText('Editar vendedor')),

    opcionVerBitacora: (page: Page) =>
        page.getByText('Ver bitácora').or(page.getByText('Visualiza el historial de tu')),

    opcionDesactivarVendedor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Desactivar vendedor' }).or(page.getByText('Desactivar vendedor')),
        
    opcionActivarVendedor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Activar vendedor' }).or(page.getByText('Activar vendedor')),

    // ─── Formulario de Creación / Edición ──────────────────────
    // Usamos selectores que terminen con el id esperado para ignorar si empieza con pv_proveedores_ o pv_vendedores_
    selectTipoDocumento: (page: Page) =>
        page.locator('[id$="form_basico:v-select:tipo-documento"] > .text'),
    
    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.getByText(tipo).nth(1).or(page.getByText(tipo).first()), // El codegen usa nth(1) a veces
        
    inputNumeroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. \d+/}),
        
    inputRazonSocial: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}),
        
    selectModoCodigo: (page: Page) =>
        page.locator('[id="_div:dropdown"]').filter({hasText: /Automático|Manual/}),

    opcionCodigoManual: (page: Page) =>
        page.getByText('Manual', {exact: true}),
        
    inputCodigoManual: (page: Page) =>
        page.locator('[id$="form_basico:v-input:codigo"]'),

    // Campos específicos de vendedor
    inputMetaMonto: (page: Page) =>
        page.locator('[id$="form_basico:v-input:meta-monto"]'),
        
    inputMetaCantidad: (page: Page) =>
        page.locator('[id$="form_basico:v-input:meta-cantidad"]'),

    inputZonaVentas: (page: Page) =>
        // Codegen usa: getByRole('textbox', { name: 'Lima sur' })
        // Buscamos un input que represente zona (idealmente un select si es que lo es)
        page.locator('[id$="form_basico:v-input:zona-ventas"]').or(page.getByRole('textbox', {name: 'Lima sur'})),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'}),
        
    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. 954588556'}),
        
    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. usuario@correo.com|srqa/}),

    // ─── Botones de Acción (Formulario) ────────────────────────
    btnCrearVendedorForm: (page: Page) =>
        page.getByRole('button', {name: 'Crear vendedor'}),

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
        page.getByText('Tu nuevo vendedor fue agregado exitosamente'),
        
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
