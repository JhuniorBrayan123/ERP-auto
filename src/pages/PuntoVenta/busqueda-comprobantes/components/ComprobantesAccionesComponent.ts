import {expect, type Page} from '@playwright/test';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export class ComprobantesAccionesComponent {
    constructor(private readonly page: Page) {
    }

    async abrirDropdownPrimerComprobante(): Promise<void> {
        await this.page.locator('.body-options > .cmp-dropdown').first().click();
    }

    async abrirDropdownPorIcono(): Promise<void> {
        await this.page.locator('.v-icon-base > .icon').first().click();
    }

    async abrirAccionesDeComprobante(numeroCompleto: string): Promise<void> {
        const partes = numeroCompleto.split('-');
        const textoBusqueda = partes.length >= 2
            ? (partes[1].replace(/^0+/, '') || partes[0] || numeroCompleto)
            : numeroCompleto;

        const filas = this.page.locator('tbody tr');
        const dropdowns = this.page.locator(
            '[id^="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:"]',
        );
        const total = await filas.count();
        for (let i = 0; i < total; i++) {
            if ((await filas.nth(i).textContent() ?? '').includes(textoBusqueda)) {
                await dropdowns.nth(i).waitFor({state: 'visible', timeout: 10_000});
                await dropdowns.nth(i).click();
                return;
            }
        }
    }

    async abrirAccionesDelPrimerComprobante(): Promise<void> {
        const dropdown = this.page.locator(
            '[id^="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:"]',
        ).first();
        await dropdown.waitFor({state: 'visible', timeout: 10_000});
        await dropdown.click();
    }

    async seleccionarAccion(nombreAccion: string): Promise<void> {
        await this.page.getByText(nombreAccion, {exact: true}).click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async seleccionarAccionPorId(idAccion: string): Promise<void> {
        await this.page.locator(`[id="${idAccion}"]`).click();
    }

    async validarAccionVisible(nombreAccion: string): Promise<void> {
        await expect(
            this.page.getByText(nombreAccion, {exact: true}),
        ).toBeVisible({timeout: 5_000});
    }

    async validarAccionOculta(nombreAccion: string): Promise<void> {
        await expect(
            this.page.getByText(nombreAccion, {exact: true}),
        ).not.toBeVisible({timeout: 3_000});
    }

    async validarOpcionesGenerarComprobante(opciones: string[]): Promise<void> {
        for (const opcion of opciones) {
            await expect(this.page.getByText(opcion, {exact: true})).toBeVisible({timeout: 5_000});
        }
    }

    async abrirGenerarComprobante(tipoComprobante: string, nombreCaja: string): Promise<Page> {
        const normalized = tipoComprobante.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\bde\b/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const optionId = `pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_generar-comprobante_li:${normalized}`;
        await this.page.locator(`[id="${optionId}"]`).click();
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).click();
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', {name: 'Continuar'}).click();
        return popupPromise;
    }

    async emitirGuiaRemisionGuardada(): Promise<void> {
        await this.page.getByText('Emitir', {exact: true}).click();
        await this.page.getByRole('button', {name: 'Emitir'}).click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async confirmarEliminacion(motivo: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(3).click();
        await this.page.getByText(motivo).click();
        await this.page.getByRole('button', {name: 'Anular'}).click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async cerrarModalExito(): Promise<void> {
        await this.page.locator('.v-modal > .icon').click();
    }

    async seleccionarCajaParaClonar(nombreCaja: string) {
        await this.page
            .locator('.cmp-card-caja')
            .filter({has: this.page.locator('.titulo').getByText(nombreCaja, {exact: true})})
            .click();
    }

    async confirmarClonacion(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', {name: 'Continuar'}).click();
        return await popupPromise;
    }

    async clonarHaciaCaja(nombreCaja: string): Promise<void> {
        await this.seleccionarAccion('Clonar comprobante');
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).click();
    }

    async validarCajaBloqueada(nombreCaja: string, mensaje: string): Promise<void> {
        await this.seleccionarAccion('Clonar comprobante');
        const card = this.page.locator('.cmp-card-caja.blocked').filter({hasText: nombreCaja});
        await expect(card.locator('.blocked-caja')).toContainText(mensaje, {timeout: 10_000});
    }
}
