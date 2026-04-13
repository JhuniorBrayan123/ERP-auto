import {type Page} from '@playwright/test';
import type {ComprobanteData, ProveedorData} from '../../helpers/Logistica/movimiento.types';

/**
 * Page Object para el panel lateral de Datos Opcionales y Comprobantes.
 *
 * Responsabilidades:
 * - Buscar y seleccionar proveedor existente
 * - Crear proveedor nuevo (desde SUNAT/RENIEC)
 * - Buscar y seleccionar cliente existente
 * - Crear campos adicionales (texto, fecha, selección, número)
 * - Llenar valores de campos adicionales
 * - Agregar comprobantes relacionados (FACTURA, BOLETA)
 * - Guardar / Cancelar datos opcionales
 */
export class DatosOpcionalesPage {
    constructor(private readonly page: Page) {
    }

    // ─── Abrir panel ────────────────────────────────────────────

    /** Click en "Datos opcionales" para abrir el panel lateral */
    async abrirDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos opcionales'}).click();
    }

    // ─── Proveedor ──────────────────────────────────────────────

    /** Busca proveedor por nombre o documento */
    async buscarProveedor(texto: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Buscar proveedor por nombre o'});
        await input.click();
        await input.fill(texto);
    }

    /** Selecciona un proveedor del listado */
    async seleccionarProveedor(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    /** Crea un proveedor nuevo completo */
    async crearProveedor(datos: ProveedorData): Promise<void> {
        await this.page.getByRole('button', {name: 'Agregar proveedor'}).click();

        // Tipo de documento
        await this.page
            .locator('[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]')
            .nth(5)
            .click();
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${datos.tipoDocumento}$`)})
            .nth(4)
            .click();

        // Número de documento
        const inputDoc = this.page.locator(
            '[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await inputDoc.click();
        await inputDoc.fill(datos.numDocumento);

        // Consultar SUNAT/RENIEC
        await this.page.getByRole('button', {name: 'Consultar SUNAT/RENIEC'}).click();

        // Dirección
        if (datos.direccion) {
            const inputDir = this.page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'});
            await inputDir.click();
            await inputDir.fill(datos.direccion);
        }

        // Teléfono
        if (datos.telefono) {
            const inputTel = this.page.getByRole('textbox', {name: 'Ej. 954588556'});
            await inputTel.click();
            await inputTel.fill(datos.telefono);
        }

        // Email
        if (datos.email) {
            const inputEmail = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
            await inputEmail.click();
            await inputEmail.fill(datos.email);
        }

        // Crear proveedor
        await this.page.getByRole('button', {name: 'Crear proveedor'}).click();
    }

    // ─── Cliente ────────────────────────────────────────────────

    /** Busca cliente por nombre o número */
    async buscarCliente(texto: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Buscar cliente por nombre o n'});
        await input.click();
        await input.fill(texto);
    }

    /** Selecciona un cliente del listado */
    async seleccionarCliente(texto: string): Promise<void> {
        await this.page.getByText(texto).click();
    }

    // ─── Campos adicionales ─────────────────────────────────────

    /** Click en "Nuevo campo adicional" */
    private async clickNuevoCampoAdicional(): Promise<void> {
        await this.page.getByText('Nuevo campo adicional').click();
    }

    /** Crea un campo de texto adicional */
    async crearCampoTexto(nombre: string): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de texto').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);
        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    /** Crea un campo de fecha adicional */
    async crearCampoFecha(nombre: string): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de fecha').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);
        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    /** Crea un campo de selección adicional con opciones */
    async crearCampoSeleccion(nombre: string, opciones: string[], seleccionarPorDefecto?: boolean): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de selección').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);

        // Llenar opciones
        for (let i = 0; i < opciones.length; i++) {
            const inputOpcion = this.page.locator(
                `[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-${i}"]`,
            );
            await inputOpcion.click();
            await inputOpcion.fill(opciones[i]);
        }

        // Seleccionar por defecto (checkbox)
        if (seleccionarPorDefecto) {
            await this.page.locator('.v-checkbox-default-label > span').first().click();
        }

        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    /** Crea un campo de número adicional */
    async crearCampoNumero(nombre: string): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de número').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);
        await this.page.locator(
            '[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-generico_v-input:valor-por-defecto"]',
        ).click();
        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    // ─── Llenar valores de campos ───────────────────────────────

    /** Llena un campo de texto adicional por índice */
    async llenarCampoTexto(indice: number, valor: string): Promise<void> {
        const input = this.page.locator(
            `[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-${indice}"]`,
        );
        await input.click();
        await input.fill(valor);
    }

    /** Click en datepicker de campo de fecha */
    async clickCampoFecha(indice: number): Promise<void> {
        await this.page
            .locator(`[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-${indice}"]`)
            .click();

        // Espera el picker correcto (v-calendar o Vuetify)
        await this.page.waitForSelector('.vc-weeks, .v-date-picker-table', {
            state: 'visible',
            timeout: 8_000,
        });
    }

    /** Selecciona una fecha en el datepicker (por nombre del botón del día) */
    async seleccionarFecha(nombreBoton: string): Promise<void> {
        await this.page.getByRole('button', {name: nombreBoton}).click();

    }

    /**
     * Selecciona el día numérico en el datepicker visible (no depende del mes ni del locale del caption).
     */
    async seleccionarDiaEnDatepickerVisible(dia: string): Promise<void> {
        const esc = dia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rxVisible = new RegExp(`^\\s*${esc}\\s*$`);
        const rxAccesible = new RegExp(
            `\\b${esc}\\b.*202\\d|de abr.*\\b${esc}\\b|\\b${esc}\\b.*abr`,
            'i',
        );

        // ── 1. v-calendar (vc-*) ──────────────────────────────────────────────────
        const vcWeeks = this.page.locator('.vc-weeks');
        if (await vcWeeks.isVisible().catch(() => false)) {
            // Intenta primero .vc-day-content, luego cualquier span/div dentro de .vc-day
            const selectores = ['.vc-day-content', '.vc-day span', '.vc-day'];
            for (const sel of selectores) {
                const el = vcWeeks.locator(sel).filter({hasText: rxVisible}).first();
                if (await el.isVisible().catch(() => false)) {
                    await el.click();
                    return;
                }
            }
        }

        // ── 2. Vuetify date-picker (v-*) ──────────────────────────────────────────
        const contenedores = [
            this.page.locator('.menuable__content__active'),
            this.page.locator('.v-menu__content').filter({has: this.page.locator('table')}),
            this.page.getByRole('dialog'),
            this.page.locator('.v-picker__body'),
            this.page.locator('.v-date-picker-body'),
            this.page.locator('.v-date-picker-table'),
        ];

        for (const contenedor of contenedores) {
            try {
                await contenedor.first().waitFor({state: 'visible', timeout: 2_000});
                const scope = contenedor.first();

                const porNombre = scope.getByRole('button', {name: rxAccesible}).first();
                if (await porNombre.isVisible().catch(() => false)) {
                    await porNombre.click();
                    return;
                }

                const porTexto = scope.locator('button, .v-btn').filter({hasText: rxVisible}).first();
                if (await porTexto.isVisible().catch(() => false)) {
                    await porTexto.click();
                    return;
                }
            } catch {
                // probar siguiente contenedor
            }
        }

        // ── 3. Fallback global ────────────────────────────────────────────────────
        const globalNombre = this.page.getByRole('button', {name: rxAccesible}).first();
        if (await globalNombre.isVisible().catch(() => false)) {
            await globalNombre.click();
            return;
        }

        await this.page
            .locator('button, .vc-day-content')
            .filter({hasText: rxVisible})
            .first()
            .click({timeout: 10_000});
    }

    /** Selecciona una opción de un campo de selección */
    async seleccionarCampoSeleccion(opcion: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(3).click();
        await this.page.getByText(opcion).click();
    }

    /** Selecciona opción desde campo de selección ya existente */
    async seleccionarOpcionDirecta(opcion: string): Promise<void> {
        await this.page.locator('div').filter({hasText: new RegExp(`^${opcion}$`)}).click();
    }

    /** Llena un campo numérico adicional por índice */
    async llenarCampoNumero(indice: number, valor: string): Promise<void> {
        const input = this.page.locator(
            `[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-${indice}"]`,
        );
        await input.click();
        await input.fill(valor);
    }

    // ─── Comprobantes ───────────────────────────────────────────

    /** Agrega un comprobante relacionado */
    async agregarComprobante(datos: ComprobanteData): Promise<void> {
        await this.page.getByRole('button', {name: 'Añadir comprobante'}).click();

        // Tipo de comprobante
        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(2).click();
        await this.page.getByText(datos.tipo).click();

        // Serie
        const inputSerie = this.page.getByRole('textbox', {name: 'Ej. B001'});
        await inputSerie.click();
        await inputSerie.fill(datos.serie);

        // Número
        const inputNumero = this.page.getByRole('textbox', {name: 'Ej. 0078'});
        await inputNumero.click();
        await inputNumero.fill(datos.numero);

        // CUC (opcional)
        if (datos.cuc) {
            const inputCuc = this.page.getByRole('textbox', {name: 'Ej. 12453589741'});
            await inputCuc.click();
            await inputCuc.fill(datos.cuc);
        }

        // Añadir
        await this.page.getByRole('button', {name: 'Añadir'}).click();
        await this.cerrarModal();
    }

    /** Agrega comprobante incompleto (para validación) */
    async agregarComprobanteParcial(tipo: string): Promise<void> {
        await this.page.getByRole('button', {name: 'Añadir comprobante'}).click();
        await this.page.getByText('Seleccionar', {exact: true}).click();
        await this.page.getByText(tipo).click();
        await this.page.getByRole('button', {name: 'Añadir'}).click();
        await this.cerrarModal();
    }

    // ─── Acciones ───────────────────────────────────────────────

    /** Click en "Guardar datos" */
    async guardarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Guardar datos'}).click();
    }

    /** Click en "Cancelar" */
    async cancelarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Cancelar', exact: true}).click();
    }

    /** Cerrar modal/overlay */
    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }
}
