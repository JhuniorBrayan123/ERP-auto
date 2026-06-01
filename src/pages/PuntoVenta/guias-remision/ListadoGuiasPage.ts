import {expect, test, type Locator, type Page} from '@playwright/test';

export class ListadoGuiasPage {
    constructor(public readonly page: Page) {}

    get successMessageEmitido() { return this.page.getByText('Tu comprobante fue emitido'); }
    get successMessageGuardado() { return this.page.getByText('Tu comprobante fue guardado'); }
    get msgBuenTrabajo() { return this.page.getByText('¡Buen trabajo!'); }
    get btnNuevaGuia() { return this.page.getByRole('button', { name: 'Nueva guía remisión remitente' }); }

    async validarGuiaEmitidaExito() {
        await expect(this.msgBuenTrabajo).toBeVisible({ timeout: 15_000 });
    }

    async validarElementosDeEnvioVisibles() {
        await expect(this.page.getByText('Enviar por WhatsApp')).toBeVisible();
        await expect(this.page.getByText('Enviar por Email')).toBeVisible();
        await expect(this.page.locator('div').filter({ hasText: /^Copiar Link$/ }).first()).toBeVisible();
        await expect(this.page.getByText('Descargar XML')).toBeVisible();
        await expect(this.page.getByText('Descargar PDF')).toBeVisible();
    }

    async validarModalPostEmisionCompleto() {
        await test.step('Validar modal post-emisión completo', async () => {
            await expect(this.page.getByRole('button', { name: 'Imprimir', exact: true })).toBeVisible();
            await expect(this.page.getByRole('button', { name: 'Imprimir Ticket' })).toBeVisible();
            await expect(this.page.getByText('Enviar por WhatsApp')).toBeVisible();
            await expect(this.page.getByText('Enviar por Email')).toBeVisible();
            await expect(this.page.getByText('Copiar Link')).toBeVisible();
            await expect(this.page.getByText('Descargar XML')).toBeVisible();
            await expect(this.page.getByText('Descargar PDF')).toBeVisible();
        });
    }

    async cerrarModalExito() {
        await this.btnNuevaGuia.click();
    }
}
