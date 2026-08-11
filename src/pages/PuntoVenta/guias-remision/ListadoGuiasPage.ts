import {expect, type Page, test} from '@playwright/test';

export class ListadoGuiasPage {
    constructor(public readonly page: Page) {
    }

    get successMessageEmitido() {
        return this.page.getByText('Tu comprobante fue emitido');
    }

    get successMessageGuardado() {
        return this.page.getByText('Tu comprobante fue guardado');
    }

    get msgBuenTrabajo() {
        return this.page.getByText('¡Buen trabajo!');
    }

    get btnNuevaGuiaRemitente() {
        return this.page.getByRole('button', {name: 'Nueva guía remisión remitente'});
    }

    get btnNuevaGuiaTransportista() {
        return this.page.getByRole('button', {name: 'Nueva guía remisión transportista'});
    }

    async validarGuiaEmitidaExito() {
        const exito = this.msgBuenTrabajo.or(this.successMessageEmitido);
        await expect(exito.first()).toBeVisible({timeout: 15_000});
    }

    async validarGuiaGuardadaExito() {
        const mensajeGuardado = this.successMessageGuardado.or(this.msgBuenTrabajo);
        const filaGuardada = this.page
            .getByRole('row')
            .filter({hasText: 'GUÍA DE REMISIÓN REMITENTE'})
            .filter({hasText: 'GUARDADO'})
            .first();

        await expect(mensajeGuardado.or(filaGuardada)).toBeVisible({timeout: 30_000});
    }

    async validarElementosDeEnvioVisibles() {
        await expect(this.page.getByText('Enviar por WhatsApp')).toBeVisible();
        await expect(this.page.getByText('Enviar por Email')).toBeVisible();
        await expect(this.page.locator('div').filter({hasText: /^Copiar Link$/}).first()).toBeVisible();
        await expect(this.page.getByText('Descargar XML')).toBeVisible();
        await expect(this.page.getByText('Descargar PDF')).toBeVisible();
    }

    async validarModalPostEmisionCompleto() {
        await test.step('Validar modal post-emisión completo', async () => {
            await expect(this.page.getByRole('button', {name: 'Imprimir', exact: true})).toBeVisible();
            await expect(this.page.getByRole('button', {name: 'Imprimir Ticket'})).toBeVisible();
            await expect(this.page.getByText('Enviar por WhatsApp')).toBeVisible();
            await expect(this.page.getByText('Enviar por Email')).toBeVisible();
            await expect(this.page.getByText('Copiar Link')).toBeVisible();
            await expect(this.page.getByText('Descargar XML')).toBeVisible();
            await expect(this.page.getByText('Descargar PDF')).toBeVisible();
        });
    }

    async cerrarModalExito() {
        const btn = this.btnNuevaGuiaRemitente.or(this.btnNuevaGuiaTransportista);
        await btn.click();
    }
}
