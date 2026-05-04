import {type Page} from '@playwright/test';
import type {ComprobanteData, ProveedorData} from '../../helpers/Logistica/movimiento.types';

export class DatosOpcionalesPage {
    constructor(private readonly page: Page) {
    }

    async abrirDatosOpcionales(): Promise<void> {
        await this.page.getByRole('button', {name: 'Datos opcionales'}).click();
    }

    async buscarProveedor(texto: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Buscar proveedor por nombre o'});
        await input.click();
        await input.fill(texto);
    }

    async seleccionarProveedor(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    async crearProveedor(datos: ProveedorData): Promise<void> {
        await this.page.getByRole('button', {name: 'Agregar proveedor'}).click();

        await this.page
            .locator('[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]')
            .nth(5)
            .click();
        await this.page
            .locator('div')
            .filter({hasText: new RegExp(`^${datos.tipoDocumento}$`)})
            .nth(4)
            .click();

        const inputDoc = this.page.locator(
            '[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await inputDoc.click();
        await inputDoc.fill(datos.numDocumento);

        await this.page.getByRole('button', {name: 'Consultar SUNAT/RENIEC'}).click();

        if (datos.direccion) {
            const inputDir = this.page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'});
            await inputDir.click();
            await inputDir.fill(datos.direccion);
        }

        if (datos.telefono) {
            const inputTel = this.page.getByRole('textbox', {name: 'Ej. 954588556'});
            await inputTel.click();
            await inputTel.fill(datos.telefono);
        }

        if (datos.email) {
            const inputEmail = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
            await inputEmail.click();
            await inputEmail.fill(datos.email);
        }

        await this.page.getByRole('button', {name: 'Crear proveedor'}).click();
    }

    async buscarCliente(texto: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Buscar cliente por nombre o n'});
        await input.click();
        await input.fill(texto);
    }

    async seleccionarCliente(texto: string): Promise<void> {
        await this.page.getByText(texto).click();
    }

    async crearCliente(datos: ProveedorData): Promise<void> {
        await this.page.getByRole('button', {name: 'Agregar cliente'}).click();

        const inputDoc = this.page.locator(
            '[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await inputDoc.click();
        await inputDoc.fill(datos.numDocumento);

        await this.page.getByRole('button', {name: 'Consultar SUNAT/RENIEC'}).click();

        if (datos.direccion) {
            const inputDir = this.page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'});
            await inputDir.click();
            await inputDir.fill(datos.direccion);
        }

        if (datos.telefono) {
            const inputTel = this.page.getByRole('textbox', {name: 'Ej. 954588556'});
            await inputTel.click();
            await inputTel.fill(datos.telefono);
        }

        if (datos.email) {
            const inputEmail = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
            await inputEmail.click();
            await inputEmail.fill(datos.email);
        }

        await this.page.getByRole('button', {name: 'Crear cliente'}).click();
    }

    private async clickNuevoCampoAdicional(): Promise<void> {
        await this.page.getByText('Nuevo campo adicional').click();
    }

    async crearCampoTexto(nombre: string): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de texto').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);
        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    async crearCampoFecha(nombre: string): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de fecha').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);
        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

    async crearCampoSeleccion(nombre: string, opciones: string[], seleccionarPorDefecto?: boolean): Promise<void> {
        await this.clickNuevoCampoAdicional();
        await this.page.getByText('Campo de selección').click();
        const inputNombre = this.page.getByRole('textbox', {name: 'Digite el nombre del nuevo'});
        await inputNombre.click();
        await inputNombre.fill(nombre);

        for (let i = 0; i < opciones.length; i++) {
            const inputOpcion = this.page.locator(
                `[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-${i}"]`,
            );
            await inputOpcion.click();
            await inputOpcion.fill(opciones[i]);
        }

        if (seleccionarPorDefecto) {
            await this.page.locator('.v-checkbox-default-label > span').first().click();
        }

        await this.page.getByRole('button', {name: 'Crear campo'}).click();
        await this.cerrarModal();
    }

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

    async llenarCampoTexto(indice: number, valor: string): Promise<void> {
        const input = this.page.locator(
            `[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-${indice}"]`,
        );
        await input.click();
        await input.fill(valor);
    }

    async clickCampoFecha(indice: number): Promise<void> {
        await this.page
            .locator(`[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-${indice}"]`)
            .click();

        await this.page.waitForSelector('.vc-weeks, .v-date-picker-table', {
            state: 'visible',
            timeout: 8_000,
        });
    }

    async seleccionarFecha(nombreBoton: string): Promise<void> {
        await this.page.getByRole('button', {name: nombreBoton}).click();

    }

    async seleccionarDiaEnDatepickerVisible(dia: string): Promise<void> {
        const esc = dia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rxVisible = new RegExp(`^\\s*${esc}\\s*$`);
        const rxAccesible = new RegExp(
            `\\b${esc}\\b.*202\\d|de abr.*\\b${esc}\\b|\\b${esc}\\b.*abr`,
            'i',
        );

        const vcWeeks = this.page.locator('.vc-weeks');
        if (await vcWeeks.isVisible().catch(() => false)) {
            const selectores = ['.vc-day-content', '.vc-day span', '.vc-day'];
            for (const sel of selectores) {
                const el = vcWeeks.locator(sel).filter({hasText: rxVisible}).first();
                if (await el.isVisible().catch(() => false)) {
                    await el.click();
                    return;
                }
            }
        }

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
            }
        }

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

    async seleccionarCampoSeleccion(opcion: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(3).click();
        await this.page.getByText(opcion).click();
    }

    async seleccionarOpcionDirecta(opcion: string): Promise<void> {
        await this.page.locator('div').filter({hasText: new RegExp(`^${opcion}$`)}).click();
    }

    async llenarCampoNumero(indice: number, valor: string): Promise<void> {
        const input = this.page.locator(
            `[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-${indice}"]`,
        );
        await input.click();
        await input.fill(valor);
    }

    async agregarComprobante(datos: ComprobanteData): Promise<void> {
        await this.page.getByRole('button', {name: 'Añadir comprobante'}).click();

        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(2).click();
        await this.page.getByText(datos.tipo).click();

        const inputSerie = this.page.getByRole('textbox', {name: 'Ej. B001'});
        await inputSerie.click();
        await inputSerie.fill(datos.serie);

        const inputNumero = this.page.getByRole('textbox', {name: 'Ej. 0078'});
        await inputNumero.click();
        await inputNumero.fill(datos.numero);

        if (datos.cuc) {
            const inputCuc = this.page.getByRole('textbox', {name: 'Ej. 12453589741'});
            await inputCuc.click();
            await inputCuc.fill(datos.cuc);
        }

        await this.page.getByRole('button', {name: 'Añadir'}).click();
        await this.cerrarModal();
    }

    async agregarComprobanteParcial(tipo: string): Promise<void> {
        await this.page.getByRole('button', {name: 'Añadir comprobante'}).click();

        // Esperar que el modal esté visible antes de interactuar
        const modal = this.page.locator('.asignacion-documento-movimiento');
        await modal.waitFor({state: 'visible'});

        // Apuntar al Seleccionar DENTRO del modal, no el del panel lateral
        await modal.getByText('Seleccionar', {exact: true}).click();
        await this.page.getByText(tipo).click();
        await this.page.getByRole('button', {name: 'Añadir'}).click();

        await this.cerrarModal();
    }

    async guardarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Guardar datos'}).click();
    }

    async cancelarDatos(): Promise<void> {
        await this.page.getByRole('button', {name: 'Cancelar', exact: true}).click();
    }

    async cerrarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }
}
