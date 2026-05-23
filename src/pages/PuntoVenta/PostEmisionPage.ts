import { expect, type Locator, type Page } from '@playwright/test';

export class PostEmisionPage {
    constructor(private readonly page: Page) {}

    // ─── Locators del Modal Post-Emisión ──────────────────────────────

    private get btnWhatsApp(): Locator {
        return this.page.locator('div').filter({ hasText: 'Enviar por WhatsApp' }).first();
    }

    private get btnEmail(): Locator {
        return this.page.locator('div').filter({ hasText: 'Enviar por Email' }).first();
    }

    private get btnCopiarLink(): Locator {
        return this.page.locator('div').filter({ hasText: 'Copiar Link' }).first();
    }

    private get btnDescargarXML(): Locator {
        return this.page.locator('div').filter({ hasText: 'Descargar XML' }).first();
    }

    private get btnDescargarPDF(): Locator {
        return this.page.locator('div').filter({ hasText: 'Descargar PDF' }).first();
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
        const inputCorreo = this.page.getByRole('textbox', { name: 'Ingresa los correos' });
        await inputCorreo.click();
        await inputCorreo.fill(correo);
        await this.page.getByRole('button', { name: 'Enviar', exact: true }).click();
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
        // Asumiendo que el texto PD01- o F001- está en el body como en el codegen:
        // "Tu comprobante fue emitido" -> PD01-00000013
        // Usaremos una extracción de texto aproximada ya que es un modal modal-content
        const textoCompleto = await this.page.locator('.v-dialog--active').innerText().catch(() => '');
        const match = textoCompleto.match(/(PD01|F001|B001|NV01|CT01)-\d+/);
        return match ? match[0] : '';
    }
}
