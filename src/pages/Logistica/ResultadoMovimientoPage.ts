import {type Download, type Page} from '@playwright/test';

/**
 * Page Object para el modal de resultado post-registro de movimientos.
 *
 * Aparece después de registrar exitosamente cualquier tipo de movimiento
 * (Ingreso, Salida, Traslado, Ajuste).
 *
 * Acciones disponibles:
 * - Enviar por WhatsApp
 * - Enviar por Email
 * - Imprimir A4
 * - Imprimir Ticket
 * - Descargar PDF
 * - Ir al listado de movimientos
 */
export class ResultadoMovimientoPage {
    constructor(private readonly page: Page) {
    }

    // ─── Locators ───────────────────────────────────────────────

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

    // ─── Acciones ───────────────────────────────────────────────

    /**
     * Envía por WhatsApp: abre la sección, llena el teléfono y envía.
     * Retorna la referencia al popup de WhatsApp.
     */
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

    /** Envía por Email: abre la sección, llena el email y envía */
    async enviarEmail(email: string): Promise<void> {
        await this.btnEmail.click();
        const inputEmail = this.page.getByRole('textbox', {name: 'email1@gmail.com, email2@'})
            .or(this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'}));
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.locator('.v-input-addon-button-text-container').click();
    }

    /** Envía por Email con botón "Enviar" explícito */
    async enviarEmailConBoton(email: string): Promise<void> {
        await this.btnEmail.click();
        const inputEmail = this.page.getByRole('textbox', {name: 'Ej. email1@gmail.com, email2@'});
        await inputEmail.click();
        await inputEmail.fill(email);
        await this.page.getByText('Enviar', {exact: true}).click();
    }

    /** Click en el botón de impresión A4 */
    async imprimirA4(): Promise<void> {
        await this.btnA4.click();
    }

    /** Click en el botón de impresión Ticket */
    async imprimirTicket(): Promise<void> {
        await this.btnTicket.click();
    }

    /** Impresión Ticket usando el ícono (variante del Codegen) */
    async imprimirTicketPorIcono(): Promise<void> {
        await this.page.locator('.icon.impresion-ticket').click();
    }

    /**
     * Descarga el PDF del movimiento.
     * Registra la promesa de download ANTES del click.
     */
    async descargarPDF(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.btnPDF.click();
        return downloadPromise;
    }

    /** Navega al listado de movimientos */
    async irAlListado(): Promise<void> {
        
        await this.btnIrAlListado.click();
    }
}
