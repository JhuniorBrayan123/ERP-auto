import {type Page, type Locator} from '@playwright/test';

export const ProveedoresTargets = {
    // ─── Navegación general y contenedores ─────────────────────
    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
    
    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    // ─── Listado Principal de Proveedores ──────────────────────
    btnCrearProveedor: (page: Page) =>
        page.locator('div').filter({ hasText: /^Crear proveedor$/ }),
    
    inputBuscar: (page: Page) =>
        page.getByRole('textbox', {name: 'Buscar por nombre, N° de'}),
    
    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),
    
    tbody: (page: Page) =>
        page.locator('tbody'),
    
    thead: (page: Page) =>
        page.locator('thead'),

    btnFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    filtroTipoDocumento: (page: Page) =>
        page.locator('div').filter({hasText: /^Tipo documento$/}).nth(2),

    filtroTipoDocEnTabla: (page: Page, tipo: string) =>
        page.locator('thead').getByText(tipo),

    // ─── Botón Contextual (3 puntos) en la tabla ───────────────
    // Captura el botón contextual basado en un regex dinámico o buscando la fila.
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

    opcionEliminarProveedor: (page: Page) =>
        page.getByText('Eliminar proveedor'),

    // ─── Formulario de Creación / Edición ──────────────────────
    selectTipoDocumento: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"] > .text'),
    
    opcionTipoDocumento: (page: Page, tipo: string) =>
        page.getByText(tipo).first(),
        
    inputNumeroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: /Ej. \d+|IN\d+/}), // Regex to match "Ej. 12345678" or "Ej. 20123456789" or "Ej. IN1234"
        
    inputRazonSocial: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}),
        
    selectModoCodigo: (page: Page) =>
        page.locator('[id="_div:dropdown"]').filter({hasText: /Automático|Manual/}),

    opcionCodigoManual: (page: Page) =>
        page.getByText('Manual', {exact: true}),
        
    inputCodigoManual: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:codigo"]'),

    inputDireccion: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'}),
        
    inputTelefono: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. 954588556'}),
        
    inputEmail: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. usuario@correo.com'}),

    // ─── Botones de Acción (Formulario) ────────────────────────
    btnCrearProveedorForm: (page: Page) =>
        page.getByRole('button', {name: 'Crear proveedor'}),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnCancelarForm: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    btnConfirmarCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Sí, cancelar'}),
        
    btnEliminarConfirmar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    sliderEstado: (page: Page) =>
        page.locator('.slider'),
        
    selectEstadoEnFormulario: (page: Page) =>
        page.locator('[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-select:estado"]'),

    opcionEstadoFormulario: (page: Page, estado: string) =>
        page.getByText(estado, { exact: true }).nth(1),

    // ─── Modales y Mensajes (Toasts) ───────────────────────────
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
        page.locator('body'), // El texto "Campo obligatorio" se busca dentro

    // ─── Bitácora y Paneles Drape ──────────────────────────────
    pestaniaBitacora: (page: Page, pestania: string) =>
        page.getByText(pestania, {exact: true}),
        
    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close'),

    // ─── Exportación ───────────────────────────────────────────
    btnOpcionesGenerales: (page: Page) =>
        page.locator('.icon-container > .icon').first(),

    opcionDescargarFiltrados: (page: Page) =>
        page.getByText('Descargar proveedores filtrados', {exact: false}).or(page.getByText('Descargar proveedores')),

    opcionDescargarTodos: (page: Page) =>
        page.getByText('Descargar todos los proveedores', {exact: false}).or(page.getByText('Descargar todos los')),
};
