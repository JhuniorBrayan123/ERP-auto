/**
 * Page Object para la selección/creación de cliente en PuntoVenta.
 *
 * Locators reales del codegen:
 * - Búsqueda: getByRole('textbox', { name: 'Buscar por nombre, razón' })
 * - Agregar: getByRole('button', { name: 'Agregar cliente' })
 * - Tipo doc: locator con id ...v-select:tipo-documento
 * - Num doc: locator con id ...v-input:num-document
 * - Crear: getByRole('button', { name: 'Crear cliente' })
 */
import { expect, type Locator, type Page } from '@playwright/test';

export class ClientePage {
    constructor(private readonly page: Page) {}

    // ─── Locators reales ──────────────────────────────────────────────

    private get inputBusqueda(): Locator {
        return this.page.getByRole('textbox', { name: 'Buscar por nombre, razón' });
    }

    private get btnAgregarCliente(): Locator {
        return this.page.getByRole('button', { name: 'Agregar cliente' });
    }

    // ─── Búsqueda y selección ─────────────────────────────────────────

    /** Busca un cliente por documento (DNI o RUC) */
    async buscarCliente(documento: string): Promise<void> {
        await this.inputBusqueda.click();
        await this.inputBusqueda.fill(documento);
        await this.page.waitForTimeout(800);
    }

    /** Selecciona un cliente del listado de resultados por texto visible */
    async seleccionarClientePorTexto(textoSelector: string): Promise<void> {
        await this.page.getByText(textoSelector).click();
    }

    /** Selecciona el cliente RUC de automatización (shortcut) */
    async seleccionarClienteRUCAuto(): Promise<void> {
        await this.buscarCliente('20759685854');
        await this.page.getByText(
            'RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente',
        ).click();
    }

    /** Selecciona un cliente DNI por número */
    async seleccionarClienteDNI(dni: string, textoResultado: string): Promise<void> {
        await this.buscarCliente(dni);
        await this.page.getByText(textoResultado).click();
    }

    /** Limpia la selección de cliente */
    async limpiarCliente(): Promise<void> {
        await this.page.locator('#undefined_delete').click();
    }

    // ─── Creación de cliente ──────────────────────────────────────────

    async abrirFormCrearCliente(): Promise<void> {
        await this.inputBusqueda.click();
        await this.btnAgregarCliente.click();
    }

    async llenarDocumento(numero: string): Promise<void> {
        const input = this.page.locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        );
        await input.click();
        await input.fill(numero);
    }

    async seleccionarTipoDocumento(tipo: 'DNI' | 'RUC'): Promise<void> {
        await this.page.locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]',
        ).nth(5).click();
        await this.page.getByText(tipo).click();
    }

    async consultarSunatReniec(): Promise<void> {
        await this.page.getByRole('button', { name: 'Consultar SUNAT/RENIEC' }).click();
    }

    async llenarDireccion(direccion: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. Calle Los Manzanos 120,' });
        await input.click();
        await input.fill(direccion);
    }

    async llenarTelefono(telefono: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. 987 654' });
        await input.click();
        await input.fill(telefono);
    }

    async llenarEmail(email: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. usuario@correo.com' });
        await input.click();
        await input.fill(email);
    }

    async clickCrearCliente(): Promise<void> {
        await this.page.getByRole('button', { name: 'Crear cliente' }).click();
    }

    /**
     * Flujo completo: crear cliente DNI con datos mínimos.
     */
    async crearClienteDNI(datos: {
        documento: string;
        direccion: string;
        telefono: string;
        email: string;
    }): Promise<void> {
        await this.abrirFormCrearCliente();
        await this.llenarDocumento(datos.documento);
        await this.consultarSunatReniec();
        await this.llenarDireccion(datos.direccion);
        await this.llenarTelefono(datos.telefono);
        await this.llenarEmail(datos.email);
        await this.clickCrearCliente();
    }

    /**
     * Flujo completo: crear cliente RUC con datos mínimos.
     */
    async crearClienteRUC(datos: {
        documento: string;
        razonSocial: string;
        direccion: string;
        telefono: string;
        email: string;
    }): Promise<void> {
        await this.abrirFormCrearCliente();
        await this.seleccionarTipoDocumento('RUC');
        await this.llenarDocumento(datos.documento);
        await this.page.getByRole('textbox', { name: 'Ej. Ladrillería Distribuidora' }).fill(datos.razonSocial);
        await this.llenarDireccion(datos.direccion);
        await this.llenarTelefono(datos.telefono);
        await this.llenarEmail(datos.email);
        await this.clickCrearCliente();
    }

    // ─── Verificaciones ───────────────────────────────────────────────

    async validarClienteSeleccionado(nombre: string): Promise<void> {
        await expect(this.page.getByText(nombre)).toBeVisible();
    }
}
