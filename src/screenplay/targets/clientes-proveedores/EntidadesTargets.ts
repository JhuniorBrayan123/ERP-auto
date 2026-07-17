import type {Page} from '@playwright/test';

/** Tipos de entidad soportados en Clientes y Proveedores */
export type TipoEntidad = 'clientes' | 'proveedores' | 'vendedores' | 'conductores';

/** Acciones contextuales del menú de 3 puntos en la tabla */
export type AccionEntidad =
    | 'Ver cliente'
    | 'Ver proveedor'
    | 'Ver vendedor'
    | 'Ver conductor'
    | 'Editar cliente'
    | 'Editar proveedor'
    | 'Editar vendedor'
    | 'Editar conductor'
    | 'Desactivar cliente'
    | 'Desactivar proveedor'
    | 'Desactivar vendedor'
    | 'Desactivar conductor'
    | 'Activar cliente'
    | 'Activar proveedor'
    | 'Activar vendedor'
    | 'Activar conductor'
    | 'Eliminar cliente'
    | 'Eliminar proveedor'
    | 'Eliminar vendedor'
    | 'Eliminar conductor'
    | 'Ver bitácora'
    | 'Ver ventas al cliente'
    | 'Ver notas adicionales';

const ID_SUBMODULO: Record<TipoEntidad, string> = {
    clientes: 'clientes',
    proveedores: 'proveedores',
    vendedores: 'vendedores',
    conductores: 'conductores',
};

export const EntidadesTargets = {
    // ─── Navegación ─────────────────────────────────────────────
    sidebarClientesProveedores: (page: Page) =>
        page.getByText('Clientes y proveedores'),

    submodulo: (page: Page, entidad: TipoEntidad) =>
        page.getByText(entidad === 'clientes' ? 'Clientes' : capitalize(entidad), {exact: true}),

    // ─── Botones de acción principal ────────────────────────────
    btnCrear: (page: Page, entidad: TipoEntidad) =>
        page.locator(`div`).filter({hasText: new RegExp(`^Crear ${singular(entidad)}$`)}),

    btnGuardar: (page: Page, entidad: TipoEntidad) =>
        page.getByRole('button', {name: `Crear ${singular(entidad)}`}),

    btnGuardarCambios: (page: Page) =>
        page.getByRole('button', {name: 'Guardar cambios'}),

    btnAtras: (page: Page) =>
        page.getByRole('button', {name: 'Atrás'}),

    btnConfirmarEliminar: (page: Page) =>
        page.getByRole('button', {name: 'Eliminar'}),

    btnConfirmarCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Sí, cancelar'}),

    btnCancelar: (page: Page) =>
        page.getByRole('button', {name: 'Cancelar'}),

    btnAceptarError: (page: Page) =>
        page.getByRole('button', {name: 'Aceptar'}),

    // ─── Formulario ─────────────────────────────────────────────
    selectTipoDocumento: (page: Page) =>
        page.locator('[id$="v-select:tipo-documento"] > .text'),

    opcionTipoDocumento: (page: Page, pos?: number) =>
        pos
            ? page.locator('.v-select-base-options.is-open > div > div').nth(pos)
            : page.locator('.v-select-base-options.is-open > div > div').first(),

    opcionTipoDocumentoPorTexto: (page: Page, texto: string) =>
        page.locator('.v-select-base-options.is-open').getByText(texto, {exact: true}),

    inputNumeroDocumento: (page: Page) =>
        page.getByRole('textbox', {name: /Ej\. (12345678|20123456789)/}),

    inputNombreRazonSocial: (page: Page) =>
        page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}),

    /** Toggle Automático/Manual para código de entidad */
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

    // ─── Selector Activo/Inactivo ───────────────────────────────
    estadoActivo: (page: Page) =>
        page.getByText('Activo', {exact: true}),

    estadoInactivo: (page: Page) =>
        page.getByText('Inactivo'),

    // ─── Tabla / Listado ────────────────────────────────────────
    inputBusquedaGeneral: (page: Page) =>
        page.getByRole('textbox', {name: /Buscar por nombre, N/}),

    tbody: (page: Page) =>
        page.locator('tbody'),

    celdaResultados: (page: Page) =>
        page.getByRole('cell'),

    filaResultados: (page: Page) =>
        page.locator('tbody > tr'),

    // ─── Menú contextual (3 puntos) ─────────────────────────────
    botonContextual: (page: Page, entidad: TipoEntidad) =>
        page.locator(`[id^="pv_${ID_SUBMODULO[entidad]}_cmp-lista-${ID_SUBMODULO[entidad]}-body-options:cmp-dropdown:opciones-${ID_SUBMODULO[entidad]}"]`),

    accionContextual: (page: Page, accion: AccionEntidad) =>
        page.getByText(accion),

    // ─── Filtros avanzados ──────────────────────────────────────
    btnVerFiltrosAvanzados: (page: Page) =>
        page.getByRole('button', {name: 'Ver filtros avanzados'}),

    btnBorrarFiltros: (page: Page) =>
        page.getByRole('button', {name: 'Borrar filtros'}),

    checkboxFiltroEstado: (page: Page, estado: 'Activo' | 'Inactivo') =>
        page.locator(`span`).filter({hasText: estado}),

    // ─── Modal / Mensajes ───────────────────────────────────────
    mensajeBuenTrabajo: (page: Page) =>
        page.getByText('¡Buen trabajo!'),

    mensajeExitoCreacion: (page: Page, entidad: TipoEntidad) => {
        const labels: Record<TipoEntidad, string> = {
            clientes: 'Tu nuevo cliente fue agregado exitosamente',
            proveedores: 'Tu nuevo proveedor fue agregado exitosamente',
            vendedores: 'Tu nuevo vendedor fue agregado exitosamente',
            conductores: 'Tu nuevo conductor fue agregado exitosamente',
        };
        return page.locator('body').getByText(labels[entidad]);
    },

    mensajeExitoEdicion: (page: Page) =>
        page.locator('body').getByText('Los cambios se guardaron exitosamente'),

    mensajeExitoEliminacion: (page: Page) =>
        page.locator('body').getByText('El cliente fue eliminado exitosamente'),

    mensajeErrorDuplicado: (page: Page) =>
        page.locator('body').getByText(/ya esta registrado, verifique los datos/),

    mensajeErrorClienteConVentas: (page: Page) =>
        page.locator('body').getByText('No puedes eliminar este cliente'),

    mensajeCampoObligatorio: (page: Page) =>
        page.locator('body').getByText('Campo obligatorio'),

    btnCerrarModal: (page: Page) =>
        page.locator('.v-modal > div').first(),

    // ─── Bitácora ───────────────────────────────────────────────
    pestaniaBitacora: (page: Page, texto: string) =>
        page.getByText(texto, {exact: true}),

    btnCerrarDrape: (page: Page) =>
        page.locator('.drape.is-open > .button-close > .icon'),

    // ─── Detalle ────────────────────────────────────────────────
    appContainer: (page: Page) =>
        page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

    // ─── Slider Activar/Desactivar ──────────────────────────────
    sliderEstado: (page: Page) =>
        page.locator('.slider'),
};

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function singular(entidad: TipoEntidad): string {
    if (entidad === 'clientes') return 'cliente';
    if (entidad === 'proveedores') return 'proveedor';
    if (entidad === 'vendedores') return 'vendedor';
    if (entidad === 'conductores') return 'conductor';
    return entidad;
}
