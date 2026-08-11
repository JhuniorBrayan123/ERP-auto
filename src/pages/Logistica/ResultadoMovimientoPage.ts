import {type Download, type Page} from '@playwright/test';

export class ResultadoMovimientoPage {
    constructor(private readonly page: Page) {
    }

    private get btnWhatsApp() {
        return this.page.locator(
            '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-whatsapp"]',
        );
    }

    private get btnEmail() {
        return this.page.locator(
            '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-correo"]',
        );
    }

    private get btnA4() {
        return this.page.locator(
            '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-a4"]',
        );
    }

    private get btnTicket() {
        return this.page.locator(
            '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-ticket"]',
        );
    }

    private get btnPDF() {
        return this.page.locator(
            '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:descarga-pdf"]',
        );
    }

    private get btnIrAlListado() {
        return this.page.getByRole('button', {name: 'Ir al listado de movimientos'});
    }

    async enviarWhatsApp(telefono: string): Promise<Page> {
        await this.btnWhatsApp.click();
        const inputTelefono = this.page.getByRole('textbox', {name: 'Coloca el teléfono'})
            .or(this.page.getByRole('textbox', {name: 'Ej.'}));
        await inputTelefono.click();
        await inputTelefono.fill(telefono);
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.locator('.v-input-addon-button-text-container').click();
        return popupPromise;
    }

    async enviarEmail(email: string): Promise<void> {
        await this.btnEmail.click();
        const inputEmail = this.page.getByRole('textbox', {name: 'email1@gmail.com, email2@'})
            .or(this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'}));
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.locator('.v-input-addon-button-text-container').click();
    }

    async enviarEmailConBoton(email: string): Promise<void> {
        await this.btnEmail.click();
        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'});
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.getByText('Enviar', {exact: true}).click();
    }

    async imprimirA4(): Promise<void> {
        await this.btnA4.click();
    }

    async imprimirTicket(): Promise<void> {
        await this.btnTicket.click();
    }

    async imprimirTicketPorIcono(): Promise<void> {
        await this.page.locator('.icon.impresion-ticket').click();
    }

    async descargarPDF(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.btnPDF.click();
        return downloadPromise;
    }

    async irAlListado(): Promise<void> {
        
        await this.btnIrAlListado.click();
    }
}
