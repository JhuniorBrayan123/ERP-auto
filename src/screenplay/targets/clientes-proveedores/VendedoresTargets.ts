import {type Page} from '@playwright/test';

export const VendedoresTargets = {
    
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

    
    
    opcionesFilaPorVendedor: (page: Page, textoBusqueda: string) =>
        page.locator('tr', {hasText: textoBusqueda}).locator('.button-actions'),

    opcionEditarVendedor: (page: Page) =>
        
        
        
        page.locator('[id$="cmp-dropdown:options-li:edicion-vendedor"]').or(page.getByText('Editar vendedor')),

    opcionVerBitacora: (page: Page) =>
        page.getByText('Ver bitácora').or(page.getByText('Visualiza el historial de tu')),

    opcionDesactivarVendedor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Desactivar vendedor' }).or(page.getByText('Desactivar vendedor')),
        
    opcionActivarVendedor: (page: Page) =>
        page.getByRole('listitem').filter({ hasText: 'Activar vendedor' }).or(page.getByText('Activar vendedor')),

    
    
    selectTipoDocumento: (page: Page) =>
        page.locator('[id$="form_basico:v-select:tipo-documento"] > .text'),
    
    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.getByText(tipo).nth(1).or(page.getByText(tipo).first()), 
        
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

    
    inputMetaMonto: (page: Page) =>
        page.locator('[id$="form_basico:v-input:meta-monto"]'),
        
    inputMetaCantidad: (page: Page) =>
        page.locator('[id$="form_basico:v-input:meta-cantidad"]'),

    inputZonaVentas: (page: Page) =>
        
        
        page.locator('[id$="form_basico:v-input:zona-ventas"]').or(page.getByRole('textbox', {name: 'Lima sur'})),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'}),
        
    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. 954588556'}),
        
    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. usuario@correo.com|srqa/}),

    
    btnCrearVendedorForm: (page: Page) =>
        page.getByRole('button', {name: 'Crear vendedor'}),

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
};
