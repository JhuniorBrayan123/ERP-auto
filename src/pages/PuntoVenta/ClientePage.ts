import {expect, type Locator, type Page} from '@playwright/test';

export class ClientePage {
    constructor(private readonly page: Page) {
    }

    private get inputBusqueda(): Locator {
        return this.page.getByRole('textbox', {name: 'Buscar por nombre, razón'});
    }

    private get btnAgregarCliente(): Locator {
        return this.page.getByRole('button', {name: 'Agregar cliente'});
    }

    private get sliderSinDocumento(): Locator {
        return this.page.locator('.slider').first();
    }

    async buscarCliente(documento: string): Promise<void> {
        await this.inputBusqueda.click();
        await this.inputBusqueda.fill(documento);
        await this.page.waitForTimeout(800);
    }

    async seleccionarClientePorTexto(textoSelector: string): Promise<void> {
        await this.page.getByText(textoSelector).click();
    }

    async seleccionarClienteRUCAuto(): Promise<void> {
        await this.buscarCliente('20759685854');
        await this.page.getByText(
            'RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente',
        ).click();
    }

    async seleccionarClienteDNI(dni: string, textoResultado: string): Promise<void> {
        await this.buscarCliente(dni);
        await this.page.getByText(textoResultado).click();
    }

    async limpiarCliente(): Promise<void> {
        await this.page.locator('#undefined_delete').click();
    }

    async llenarDatosClienteSinDocumento(nombre: string, direccion: string): Promise<void> {
        await this.sliderSinDocumento.click();

        const inputNombre = this.page.getByRole('textbox', {name: 'Nombre/Razón social'});
        await inputNombre.click();
        await inputNombre.fill(nombre);

        const inputDireccion = this.page.getByRole('textbox', {name: 'Dirección'});
        await inputDireccion.click();
        await inputDireccion.fill(direccion);
    }

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

    async seleccionarTipoDocumento(tipo: 'DNI' | 'RUC' | 'Carnet Extranjeria'): Promise<void> {
        await this.page.locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]',
        ).nth(5).click();
        await this.page.getByText(tipo, {exact: true}).click();
    }

    async consultarSunatReniec(): Promise<void> {
        await this.page.getByRole('button', {name: 'Consultar SUNAT/RENIEC'}).click();
    }

    async llenarDireccion(direccion: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Ej. Calle Los Manzanos 120,'});
        await input.click();
        await input.fill(direccion);
    }

    async llenarTelefono(telefono: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Ej. 987 654'});
        await input.click();
        await input.fill(telefono);
    }

    async llenarEmail(email: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Ej. usuario@correo.com'});
        await input.click();
        await input.fill(email);
    }

    async clickCrearCliente(): Promise<void> {
        await this.page.getByRole('button', {name: 'Crear cliente'}).click();
    }

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
        await this.page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'}).fill(datos.razonSocial);
        await this.llenarDireccion(datos.direccion);
        await this.llenarTelefono(datos.telefono);
        await this.llenarEmail(datos.email);
        await this.clickCrearCliente();
    }

    async crearClienteExtranjeria(datos: {
        documento: string;
        nombre: string;
        direccion: string;
        telefono: string;
        email: string;
    }): Promise<void> {
        await this.abrirFormCrearCliente();
        await this.seleccionarTipoDocumento('Carnet Extranjeria');
        await this.llenarDocumento(datos.documento);
        
        const inputNombre = this.page.getByRole('textbox', {name: 'Ej. Ladrillería Distribuidora'})
        await inputNombre.first().click();
        await inputNombre.first().fill(datos.nombre);

        await this.llenarDireccion(datos.direccion);
        await this.llenarTelefono(datos.telefono);
        await this.llenarEmail(datos.email);
        await this.clickCrearCliente();
    }

    async validarClienteSeleccionado(nombre: string): Promise<void> {
        await expect(this.page.getByText(nombre)).toBeVisible();
    }
}
