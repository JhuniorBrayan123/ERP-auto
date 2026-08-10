import { type Locator, type Page } from '@playwright/test';

export interface ConductorData {
    tipoDocumento: string;
    documento: string;
    nombre: string;
    codigo: string;
    categoria: string;
    placa: string;
    zona: string;
    direccion: string;
    telefono: string;
    email: string;
}

export class ConductorPage {
    constructor(private readonly page: Page) {
    }

    private get inputBusqueda(): Locator {
        return this.page.getByRole('textbox', { name: 'Buscar por nombre, N° de' });
    }

    private get btnCrearConductor(): Locator {
        return this.page.getByText('Crear conductor', { exact: true });
    }

    async buscarConductor(documento: string): Promise<void> {
        await this.inputBusqueda.click();
        await this.inputBusqueda.fill(documento);
        await this.inputBusqueda.press('Enter');
        await this.page.waitForTimeout(1000);
    }

    async abrirFormCrearConductor(): Promise<void> {
        await this.btnCrearConductor.click();
    }

    async seleccionarTipoDocumento(tipo: string): Promise<void> {
        const selector = this.page.locator(
            '[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]',
        ).first();

        const textoActual = await selector.locator('.v-text').textContent();
        if (textoActual?.trim() === tipo) {
            console.log(`      Tipo documento ya es ${tipo}`);
            return;
        }

        await selector.click();
        await this.page.getByText(tipo, { exact: true }).first().click();
    }

    async llenarDocumento(numero: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. 12345678' });
        await input.click();
        await input.fill(numero);
    }

    async llenarNombre(nombre: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. Ladrillería Distribuidora' });
        await input.click();
        await input.fill(nombre);
    }

    async cambiarCodigoAManual(codigo: string): Promise<void> {
        await this.page.locator('[id="_div:dropdown"]').getByText('Automático').click();
        await this.page.getByText('Manual').click();

        const inputCodigo = this.page.locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:codigo"]',
        );
        await inputCodigo.click();
        await inputCodigo.fill(codigo);
    }

    async seleccionarCategoria(categoria: string): Promise<void> {
        const selector = this.page.locator('.v-select-header-form').filter({ hasText: 'Seleccionar' }).first();
        await selector.click();

        await this.page.locator('.v-select-base-options.is-open').first().waitFor({ state: 'visible', timeout: 5_000 });
        await this.page.getByText(categoria, { exact: true }).first().click({ force: true });
    }

    async llenarPlaca(placa: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. AB12CD34EF' });
        await input.click();
        await input.fill(placa);
    }

    async llenarZona(zona: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Lima sur' });
        await input.click();
        await input.fill(zona);
    }

    async llenarDireccion(direccion: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. Calle Los Manzanos 120,' });
        await input.click();
        await input.fill(direccion);
    }

    async llenarTelefono(telefono: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. 954588556' });
        await input.click();
        await input.fill(telefono);
    }

    async llenarEmail(email: string): Promise<void> {
        const input = this.page.getByRole('textbox', { name: 'Ej. usuario@correo.com' });
        await input.click();
        await input.fill(email);
    }

    async clickCrearConductor(): Promise<void> {
        await this.page.locator('[id="pv_conductores_registro-conductor:draper_v_button:registrar-conductor"]').first().click();
    }

    async cerrarModalExito(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async crearConductor(datos: ConductorData): Promise<void> {
        await this.abrirFormCrearConductor();
        await this.seleccionarTipoDocumento(datos.tipoDocumento);
        await this.llenarDocumento(datos.documento);
        await this.llenarNombre(datos.nombre);
        await this.cambiarCodigoAManual(datos.codigo);
        await this.seleccionarCategoria(datos.categoria);
        await this.llenarPlaca(datos.placa);
        await this.llenarZona(datos.zona);
        await this.llenarDireccion(datos.direccion);
        await this.llenarTelefono(datos.telefono);
        await this.llenarEmail(datos.email);
        await this.clickCrearConductor();
    }
}
