import { expect, type Locator, type Page } from '@playwright/test';

export class PostEmisionPage {
    constructor(private readonly page: Page) {}

    // ─── Locators del Modal Post-Emisión ──────────────────────────────

    private get btnWhatsApp(): Locator {
        return this.page.locator('div').filter({ hasText: 'Enviar por WhatsApp' }).first();
    }

    private get btnEmail(): Locator {
        return this.page.locator('.medio', { hasText: 'Enviar por Email' }).first();
    }
    private get btnEnviar(): Locator {
        return this.page.getByText('Enviar', { exact: true }).locator('..').locator('..');
    }

    private get btnCopiarLink(): Locator {
        return this.page.locator('div').filter({ hasText: 'Copiar Link' }).first();
    }

    private get btnDescargarXML(): Locator {
        return this.page.getByText( 'Descargar XML' ).first();
    }

    private get btnDescargarPDF(): Locator {
        return this.page.getByText('Descargar PDF', { exact: true }).locator('..').locator('..');
    }

    private get btnImprimir(): Locator {
        return this.page.getByRole('button', { name: 'Imprimir', exact: true });
    }

    private get btnImprimirTicket(): Locator {
        return this.page.getByRole('button', { name: 'Imprimir Ticket' });
    }

    private get btnNuevaVenta(): Locator {
        return this.page.getByRole('button', { name: 'Nueva Venta' });
    }

    private get textoExito(): Locator {
        return this.page.getByText('¡Buen trabajo!');
    }

    // ─── Acciones Atómicas ────────────────────────────────────────────

    async clickWhatsApp(): Promise<void> {
        await this.btnWhatsApp.click();
    }

    async clickEmail(): Promise<void> {
        await this.btnEmail.click();
    }


    async clickCopiarLink(): Promise<void> {
        await this.btnCopiarLink.click();
    }

    async clickDescargarXML(): Promise<void> {
        await this.btnDescargarXML.click();
    }

    async clickDescargarPDF(): Promise<void> {
        await this.btnDescargarPDF.click();
    }

    async clickImprimir(): Promise<void> {
        await this.btnImprimir.click();
    }

    async clickImprimirTicket(): Promise<void> {
        await this.btnImprimirTicket.click();
    }

    async clickNuevaVenta(): Promise<void> {
        await this.btnNuevaVenta.click();
    }

    // ─── Lógica UI Específica ─────────────────────────────────────────

    async enviarEmail(correo: string): Promise<void> {
        await this.clickEmail();
        const inputCorreo = this.page.getByRole('textbox', { name: 'Ej. email@gmail.com, email2@outlook.com' });
        await inputCorreo.click();
        await inputCorreo.fill(correo);
        await this.btnEnviar.click();
    }


    async estaVisible(): Promise<boolean> {
        try {
            await this.textoExito.waitFor({ state: 'visible', timeout: 15_000 });
            return true;
        } catch {
            return false;
        }
    }

    async obtenerCorrelativoDinamico(): Promise<string> {
        const regex = /(PD01|F001|B001|NV01|CT01)-\d+/;

        // Buscamos el texto en toda la página. Usamos .last() por si acaso
        // el correlativo anterior se quedó renderizado en la página de fondo.
        const locator = this.page.getByText(regex).last();

        // Esto esperará a que el texto sea visible
        const texto = await locator.innerText();
        const match = texto.match(regex);

        return match ? match[0] : '';
    }
}
